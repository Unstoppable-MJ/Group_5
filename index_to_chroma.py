import os
import django
from django.conf import settings

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from stocks.models import Stock
from portfolio.models import Portfolio
from chatbot.services import get_vector_store
from langchain_core.documents import Document

def index_project_data():
    print("Initializing vector store...")
    vector_store = get_vector_store()
    
    documents = []
    
    # Index Stocks
    print("Fetching stocks...")
    stocks = Stock.objects.all()
    for stock in stocks:
        content = f"Stock Symbol: {stock.symbol}, Name: {stock.name}, Sector: {stock.sector}"
        doc = Document(
            page_content=content,
            metadata={"type": "stock", "symbol": stock.symbol, "id": stock.id}
        )
        documents.append(doc)
    
    # Index Portfolios
    print("Fetching portfolios...")
    portfolios = Portfolio.objects.all()
    for portfolio in portfolios:
        content = f"Portfolio Name: {portfolio.name}, Description: {portfolio.description}, Type: {portfolio.portfolio_type}"
        doc = Document(
            page_content=content,
            metadata={"type": "portfolio", "name": portfolio.name, "id": portfolio.id}
        )
        documents.append(doc)
    
    if documents:
        print(f"Indexing {len(documents)} documents into ChromaDB...")
        vector_store.add_documents(documents)
        print("Indexing complete!")
    else:
        print("No documents found to index.")

if __name__ == "__main__":
    index_project_data()
