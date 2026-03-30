import os
import sys
import django
import yfinance as yf

# Setup Django
sys.path.append(r"d:\Project_Intership\EDA\stock_project")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from stocks.views import get_safe_pe_ratio

def test_pe_null_logic():
    # Test a known symbol or a fake one to trigger None
    symbols = ["RELIANCE.NS", "INVALID_STOCK_XYZ"]
    
    print("--- Testing PE Null Logic ---")
    for s in symbols:
        pe = get_safe_pe_ratio(s)
        print(f"Symbol: {s} -> PE: {pe} (Type: {type(pe)})")
        
    print("\nVerification: If INVALID_STOCK_XYZ is None, test PASSED.")

if __name__ == "__main__":
    test_pe_null_logic()
