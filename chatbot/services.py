import os
import re
from django.conf import settings
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage

from stocks.models import Stock, PortfolioStock
from portfolio.models import Portfolio

# Define the state for the graph
class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    context: str
    user_portfolio: str

def get_vector_store():
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.GEMINI_API_KEY
    )
    persist_directory = os.path.join(settings.BASE_DIR, "chromadb_data")
    return Chroma(
        collection_name="stock_knowledge",
        embedding_function=embeddings,
        persist_directory=persist_directory
    )

def get_user_portfolio_context(user_id):
    if not user_id:
        return ""
    
    try:
        portfolios = Portfolio.objects.filter(user_id=user_id)
        if not portfolios.exists():
            return "User has no portfolios."
        
        context = "User's Portfolio Data:\n"
        for p in portfolios:
            context += f"- Portfolio: {p.name} ({p.portfolio_type})\n"
            stocks = PortfolioStock.objects.filter(portfolio=p)
            for ps in stocks:
                context += f"  * Stock: {ps.stock.symbol}, Qty: {ps.quantity}, Buy Price: {ps.buy_price}, Current Price: {ps.current_price}, P/E: {ps.pe_ratio}\n"
        return context
    except Exception as e:
        return f"Error fetching portfolio: {str(e)}"

def get_current_portfolio_context(user_id, current_portfolio_id=None, current_portfolio_name=None, current_portfolio_type=None):
    if not current_portfolio_id:
        return "", ""

    try:
        portfolio = Portfolio.objects.filter(id=current_portfolio_id).first()
        if not portfolio:
            return "", ""

        portfolio_type = current_portfolio_type or getattr(portfolio, "portfolio_type", "")
        portfolio_name = current_portfolio_name or portfolio.name

        context_lines = [f"Current Portfolio Focus: {portfolio_name}"]

        portfolio_stocks = PortfolioStock.objects.filter(portfolio=portfolio).select_related("stock")
        if portfolio_stocks.exists():
            if user_id and portfolio.user_id and str(portfolio.user_id) != str(user_id):
                return "", ""

            if portfolio_type:
                context_lines.append(f"Portfolio Type: {portfolio_type}")

            sectors = sorted({ps.stock.sector for ps in portfolio_stocks if ps.stock and ps.stock.sector})
            if sectors:
                context_lines.append(f"Sectors in Focus: {', '.join(sectors)}")

            context_lines.append("Holdings:")
            for ps in portfolio_stocks:
                context_lines.append(
                    f"- {ps.stock.symbol} ({ps.stock.sector or 'Unknown Sector'}), Qty: {ps.quantity}, "
                    f"Buy Price: {ps.buy_price}, Current Price: {ps.current_price}, P/E: {ps.pe_ratio}"
                )
            return "\n".join(context_lines), ", ".join(sectors)

        # Sector portfolios may not have PortfolioStock rows yet, so infer the sector from the portfolio name.
        sector_name = portfolio_name.replace(" Portfolio", "").strip()
        sector_stocks = list(
            Stock.objects.filter(sector__iexact=sector_name).order_by("symbol")[:25]
        )
        if sector_stocks:
            context_lines.append("Sector-only Portfolio")
            context_lines.append(f"Sector in Focus: {sector_name}")
            context_lines.append("Relevant Stocks:")
            for stock in sector_stocks:
                context_lines.append(f"- {stock.symbol} ({stock.name})")
            return "\n".join(context_lines), sector_name

        return "\n".join(context_lines), ""
    except Exception as e:
        return f"Error fetching current portfolio: {str(e)}", ""

def get_chatbot_response(
    user_input: str,
    history: list = None,
    user_id: str = None,
    is_recommendation: bool = False,
    current_portfolio_id: str = None,
    current_portfolio_name: str = None,
    current_portfolio_type: str = None,
):
    try:
        # Set up the LLM
        llm = ChatGoogleGenerativeAI(
            model="gemini-flash-latest",
            google_api_key=settings.GEMINI_API_KEY
        )

        vector_store = get_vector_store()
        user_portfolio = get_user_portfolio_context(user_id)
        current_portfolio_context, current_focus_sector = get_current_portfolio_context(
            user_id,
            current_portfolio_id=current_portfolio_id,
            current_portfolio_name=current_portfolio_name,
            current_portfolio_type=current_portfolio_type,
        )
    except Exception as e:
        return f"I'm sorry, I couldn't initialize the chatbot services right now. Details: {str(e)}"

    # Define the retrieve node
    def retrieve(state: State):
        try:
            last_message = state["messages"][-1].content
            # For recommendations, we search for "top performing stocks" or "investment ideas"
            if is_recommendation:
                query = "stock investment recommendations and market trends"
            else:
                query = last_message

            if current_focus_sector:
                query = f"{query} focused on {current_focus_sector} sector stocks"

            docs = vector_store.similarity_search(query, k=5)
            context = "\n".join([doc.page_content for doc in docs])
            return {"context": context}
        except Exception as e:
            print(f"Retrieval error: {e}")
            return {"context": "Context retrieval failed due to API limitations."}

    # Define the chatbot node
    def chatbot(state: State):
        is_logged_in = bool(user_id)
        
        # Model accuracy comparison data
        model_comparison_info = """
ChatSense uses four main categories of prediction models. Here is a comparison of their typical accuracy based on our backtesting metrics:

1. **Regression Models (e.g., Ridge, Lasso)**:
   - **Typical Accuracy**: 85-92%
   - **Best For**: Capturing linear trends and short-term price movements based on technical indicators (SMA, Lags).
   - **Note**: Stable but may struggle with sudden market volatility.

2. **Time Series Models (ARIMA, SARIMA, Prophet)**:
   - **Typical Accuracy**: 80-88%
   - **Best For**: Detecting seasonality and long-term cycles in price data.
   - **Note**: ARIMA is excellent for stationary data, while Prophet handles holidays and trends well.

3. **Deep Learning Models (RNN, LSTM, GRU)**:
   - **Typical Accuracy**: 88-95%
   - **Best For**: Capturing non-linear patterns and complex momentum shifts.
   - **Note**: LSTM (Long Short-Term Memory) is generally our most accurate model for complex price behaviors because it can 'remember' long-term dependencies.

4. **Hybrid Models**:
   - **Typical Accuracy**: 90-96%
   - **Best For**: Combining the strengths of two different architectures (e.g., ARIMA for trend + LSTM for residuals).
   - **Note**: Often provides the most robust results by averaging predictions.

*Accuracy is measured using MAPE (Mean Absolute Percentage Error) subtracted from 100% during backtesting on historical data.*
"""

        FORMATTING_RULES = """
FORMATTING AND STRUCTURE RULES:
1. Start with a brief, professional introduction (2-3 lines).
2. For each stock recommendation, follow this EXACT Markdown structure:
   ## 1. Stock Name (Ticker)
   
   **Sector:**
   [Identify the sector]
   
   **Model Fit:**
   [Provide a brief model or prediction insight]
   
   **Rationale:**
   [2-3 lines explaining the fit for the portfolio]
   
   (Ensure a blank line exists between each stock section)
3. End with a concise summary (2-3 lines) explaining the overall strategy alignment.
4. General Style:
   - Use bold for labels: **Sector:**, **Model Fit:**, **Rationale:**.
   - Use Markdown headings (##) for stock titles.
   - Keep each explanation segment to 3-4 lines maximum.
   - Avoid long, dense paragraphs. 
   - Use bullet points for lists if necessary.
   - Tone: Professional, advisor-like, clear, and concise.
"""

        if is_recommendation:
            system_prompt = f"""You are a stock market expert providing personalized recommendations.
Use the user's current portfolio (if available) to suggest complementary stocks or adjustments.
Use the general context for current market ideas.

{model_comparison_info}

CURRENT PAGE PORTFOLIO:
{current_portfolio_context if current_portfolio_context else "No active portfolio page selected."}

USER PORTFOLIO:
{user_portfolio if user_portfolio else "No portfolio data (Guest)."}

GENERAL CONTEXT:
{state.get('context', 'No specific context found.')}

If a CURRENT PAGE PORTFOLIO is provided, keep the recommendations restricted to that portfolio's sector or holdings unless the user explicitly asks to compare with other sectors.
Provide 3-5 specific stock recommendations with brief rationales based on sectors, diversification, or recent trends found in the context.
If the user is a guest, provide general top-performing sector recommendations.

{FORMATTING_RULES}
"""
        elif is_logged_in:
            system_prompt = f"""You are a helpful stock trading assistant for a logged-in user.
Use the user's portfolio data provided below to answer their questions. 
Also use the general context from our database if relevant.

{model_comparison_info}

CURRENT PAGE PORTFOLIO:
{current_portfolio_context if current_portfolio_context else "No active portfolio page selected."}

USER PORTFOLIO:
{user_portfolio}

GENERAL CONTEXT:
{state.get('context', 'No specific context found.')}

If the user asks about model accuracy or comparison, use the provided comparison info.
If the user asks about their holdings, performance, or specific stocks they own, prioritize the USER PORTFOLIO data.
If CURRENT PAGE PORTFOLIO is provided, answer primarily about that portfolio only.
If it is a sector portfolio such as IT, keep the answer focused on stocks from that sector unless the user explicitly asks to broaden the scope.

{FORMATTING_RULES if is_recommendation else ""}
"""
        else:
            system_prompt = f"""You are a helpful stock trading assistant. 
The user is a guest (not logged in). Answer general stock market questions.
Use the following context from our database if relevant.

{model_comparison_info}

CURRENT PAGE PORTFOLIO:
{current_portfolio_context if current_portfolio_context else "No active portfolio page selected."}

CONTEXT:
{state.get('context', 'No specific context found.')}

If the user asks about model accuracy or comparison, use the provided comparison info.
If the context doesn't contain the answer, use your general knowledge but mention that it's general knowledge.
If CURRENT PAGE PORTFOLIO is provided, keep the answer focused on that portfolio or sector.
Encourage the user to log in to see their personal portfolio analysis.
"""
        messages = [SystemMessage(content=system_prompt)] + state["messages"]
        try:
            response = llm.invoke(messages)
            return {"messages": [response]}
        except Exception as e:
            print(f"Chatbot invoke error: {e}")
            return {"messages": [AIMessage(content="I'm sorry, I encountered an error while processing your request. Please check if your Gemini API key is valid and not leaked.")]}

    # Build the graph
    workflow = StateGraph(State)
    workflow.add_node("retrieve", retrieve)
    workflow.add_node("chatbot", chatbot)
    
    workflow.add_edge(START, "retrieve")
    workflow.add_edge("retrieve", "chatbot")
    workflow.add_edge("chatbot", END)
    
    app = workflow.compile()

    # Prepare initial messages
    messages = []
    if history:
        for msg in history:
            if msg['role'] == 'user':
                messages.append(HumanMessage(content=msg['content']))
            else:
                messages.append(AIMessage(content=msg['content']))
    
    messages.append(HumanMessage(content=user_input))

    # Run the graph
    try:
        final_state = app.invoke({"messages": messages})
    except Exception as e:
        return f"I'm sorry, I encountered an error while generating a response. Details: {str(e)}"
    
    content = final_state["messages"][-1].content
    if isinstance(content, list):
        # Extract text from content blocks if it's a list
        final_text = "".join([block["text"] if isinstance(block, dict) and "text" in block else str(block) for block in content])
    else:
        final_text = content
    
    return format_chatbot_response(final_text)

def format_chatbot_response(text):
    """
    Cleans and formats chatbot responses for better readability.
    Handles OCR-style messy text, MCQ options, and general spacing.
    If Markdown structure is already present, it trusts and preserves it.
    """
    if not text:
        return ""
    
    # 1. Basic cleanup: Normalize whitespace
    text = text.strip()
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\r\n|\r', '\n', text)
    
    # 2. If Markdown structure (headings or bold) exists, we trust it and just normalize newlines.
    if "##" in text or "**" in text:
        return re.sub(r'\n{3,}', '\n\n', text).strip()
    
    # 3. OCR Cleaning: Add dots where missing for numbered lists and options
    # Matches "1 " but not "1." at start or after space, followed by an uppercase letter
    text = re.sub(r'(^|\s)(\d+)\b\s+([A-Z])', r'\1\2. \3', text)
    # Matches " A " but not " A." 
    text = re.sub(r'(^|\s)\b([A-D])\b\s+', r'\1\2. ', text)
    
    # 4. Inject newlines before questions and options
    # Double newline before "1. ", "2. ", etc. (for paragraph spacing)
    text = re.sub(r'\s*(\d+\.\s+)', r'\n\n\1', text)
    # Single newline before "A. ", "B. ", etc. (to group with question)
    text = re.sub(r'\s*([A-D]\.\s*)', r'\n\1', text)
    
    # 5. Add double newlines after sentences but avoid breaking list markers
    # Negative lookbehind ensures we don't break "1. " or "A. "
    text = re.sub(r'(?<!\d)(?<!\b[A-D])([.?!:])\s+', r'\1\n\n', text)
    
    # 6. Final cleanup: Standardize multiple newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text.strip()
