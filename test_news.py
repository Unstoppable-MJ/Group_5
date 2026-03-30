import yfinance as yf
import json

def test_news(symbol):
    print(f"--- Testing News for {symbol} ---")
    ticker = yf.Ticker(symbol)
    print(f"Ticker News Count: {len(ticker.news)}")
    
    # Try Search
    try:
        search = yf.Search(symbol)
        print(f"Search News Count: {len(search.news)}")
        for i, n in enumerate(search.news[:5]):
            print(f"Search News {i+1}: {n.get('title')}")
    except Exception as e:
        print(f"Search failed: {e}")

if __name__ == "__main__":
    test_news("TCS.NS")
    test_news("ICICIBANK.NS")
    test_news("RELIANCE.NS")
