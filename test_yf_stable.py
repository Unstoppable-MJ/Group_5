import yfinance as yf
import requests
import time

def test_stable_pe(symbol):
    print(f"\n--- Testing Stable PE for {symbol} ---")
    session = requests.Session()
    session.headers.update({
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
    })
    
    # Try multiple times to see if it's flaky
    for i in range(3):
        try:
            ticker = yf.Ticker(symbol, session=session)
            pe = ticker.info.get("trailingPE")
            print(f"Attempt {i+1}: PE = {pe}")
            if pe: break
        except Exception as e:
            print(f"Attempt {i+1} Error: {e}")
        time.sleep(1)

if __name__ == "__main__":
    test_stable_pe("RELIANCE.NS")
    test_stable_pe("MSFT")
    test_stable_pe("AAPL")
