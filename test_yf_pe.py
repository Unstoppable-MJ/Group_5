import yfinance as yf
import requests

def test_pe(symbol):
    print(f"\n--- Testing {symbol} ---")
    
    # 1. Standard approach
    try:
        t = yf.Ticker(symbol)
        info = t.info
        pe = info.get("trailingPE", info.get("forwardPE", None))
        print(f"Info Trailing PE: {pe}")
    except Exception as e:
        print(f"Info Error: {e}")
        
    # 2. Fast Info (newer yfinance)
    try:
        t = yf.Ticker(symbol)
        # Fast info usually doesn't have PE but let's check
        print(f"Fast Info Items: {list(t.fast_info.keys()) if hasattr(t, 'fast_info') else 'No fast_info'}")
    except Exception as e:
        print(f"Fast Info Error: {e}")

    # 3. Custom session
    try:
        session = requests.Session()
        session.headers.update({'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
        t = yf.Ticker(symbol, session=session)
        pe = t.info.get("trailingPE")
        print(f"Session Info Trailing PE: {pe}")
    except Exception as e:
        print(f"Session Info Error: {e}")

if __name__ == "__main__":
    test_pe("RELIANCE.NS")
    test_pe("MSFT")
