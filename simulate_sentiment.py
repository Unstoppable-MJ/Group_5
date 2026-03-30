import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

import yfinance as yf
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk
from stocks.views import resolve_yahoo_symbol
from stocks.models import Stock

def run_sentiment_sim(symbol):
    print(f"--- Simulating for: {symbol} ---")
    yahoo_symbol = resolve_yahoo_symbol(symbol)
    base_symbol = yahoo_symbol.upper().replace(".NS", "")
    db_symbol_candidates = [symbol.upper(), yahoo_symbol.upper(), base_symbol.upper()]
    
    all_news = []
    stock_obj = Stock.objects.filter(symbol__in=db_symbol_candidates).first()
    company_name = stock_obj.name if stock_obj else base_symbol
    
    print(f"  Company Name: {company_name}")
    
    # 1. Ticker news
    ticker = yf.Ticker(yahoo_symbol)
    t_news = getattr(ticker, 'news', [])
    all_news.extend(t_news)
    print(f"  Ticker News: {len(t_news)}")
    
    # 2. Search
    try:
        search_query = f"{company_name} share price news"
        results = yf.Search(search_query).news
        all_news.extend(results)
        print(f"  Search 1 News: {len(results)}")
    except: pass
    
    # 3. Search 2
    try:
        search_query_2 = f"{base_symbol} news India"
        results_2 = yf.Search(search_query_2).news
        all_news.extend(results_2)
        print(f"  Search 2 News: {len(results_2)}")
    except: pass

    # Filter/Select logic from views.py
    seen_titles = set()
    valid_news = []
    # (Simplified relevance filtering for speed, but same selection logic)
    for n in all_news:
        title = n.get('title') or n.get('text') or n.get('headline')
        if title and title not in seen_titles:
            valid_news.append(n)
            seen_titles.add(title)
        if len(valid_news) >= 5: break
        
    print(f"  Valid News Count: {len(valid_news)}")
    
    analyzer = SentimentIntensityAnalyzer()
    all_sentiments = []
    for item in valid_news:
        title = item.get('title') or item.get('text') or item.get('headline')
        if title:
            score = analyzer.polarity_scores(title)['compound']
            all_sentiments.append(score)
            print(f"    - [{score:+.4f}] {title[:60]}...")
            
    if all_sentiments:
        avg_compound = sum(all_sentiments) / len(all_sentiments)
        confidence = min(99.9, 35 + (len(all_sentiments) * 12) + (abs(avg_compound) * 25))
        print(f"  => FINAL: Score={avg_compound:.4f}, Confidence={confidence:.1f}%")
    else:
        print("  => FINAL: No sentiment data.")
    print("-" * 30)

if __name__ == "__main__":
    nltk.download('vader_lexicon', quiet=True)
    test_stocks = ["IRB.NS", "RELIANCE.NS", "TCS.NS", "BAJAJ-AUTO.NS"]
    for s in test_stocks:
        run_sentiment_sim(s)
