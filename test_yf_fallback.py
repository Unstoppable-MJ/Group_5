import yfinance as yf
import time

def test_pe_fallback(symbol):
    print(f"\n--- Testing Fallback for {symbol} ---")
    try:
        t = yf.Ticker(symbol)
        
        # 1. Try Financials for EPS
        print("Fetching Financials...")
        fin = t.financials
        if not fin.empty:
            # Look for 'Basic EPS' or 'Diluted EPS'
            print("Financials found. Rows:", fin.index.tolist())
            eps_rows = [row for row in fin.index if 'EPS' in row]
            print("EPS Rows:", eps_rows)
            if eps_rows:
                latest_eps = fin.loc[eps_rows[0]].iloc[0]
                print(f"Latest EPS: {latest_eps}")
        else:
            print("Financials empty.")
            
        # 2. Try fast_info for basic stats
        print("Checking fast_info...")
        if hasattr(t, 'fast_info'):
            print("Fast Info Keys:", list(t.fast_info.keys()))
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_pe_fallback("RELIANCE.NS")
    test_pe_fallback("MSFT")
