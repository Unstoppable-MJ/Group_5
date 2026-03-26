import yfinance as yf
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

def test_sentiment(symbol, company_name):
    print(f"Testing {symbol} ({company_name})...")
    all_news = []
    
    # 1. Ticker news
    try:
        ticker = yf.Ticker(symbol)
        all_news.extend(getattr(ticker, 'news', []))
    except: pass
    
    # 2. Search
    try:
        search_query = f"{company_name} share price news"
        search_results = yf.Search(search_query)
        all_news.extend(search_results.news)
    except: pass
    
    # 3. Another search
    try:
        search_query_2 = f"{symbol} news India"
        search_results_2 = yf.Search(search_query_2)
        all_news.extend(search_results_2.news)
    except: pass
    
    print(f"Raw news count: {len(all_news)}")
    
    # Simplified filtering (take first 5)
    valid_news = all_news[:5]
    
    analyzer = SentimentIntensityAnalyzer()
    all_sentiments = []
    for item in valid_news:
        title = item.get('title') or item.get('text') or item.get('headline')
        if title:
            score = analyzer.polarity_scores(title)['compound']
            all_sentiments.append(score)
            # print(f"  - {title[:50]}... -> {score}")
            
    if not all_sentiments:
        print("No sentiments found.")
        return
        
    avg_compound = sum(all_sentiments) / len(all_sentiments)
    confidence = min(99.9, 35 + (len(all_sentiments) * 12) + (abs(avg_compound) * 25))
    
    print(f"Result: {avg_compound:.4f} score, {confidence:.1f}% confidence")
    print("-" * 20)

if __name__ == "__main__":
    try:
        nltk.download('vader_lexicon')
    except: pass
    
    stocks = [
        ("RELIANCE.NS", "Reliance Industries"),
        ("TCS.NS", "Tata Consultancy Services"),
        ("IRB.NS", "IRB Infrastructure"),
        ("AAPL", "Apple Inc.")
    ]
    
    for s, n in stocks:
        test_sentiment(s, n)
