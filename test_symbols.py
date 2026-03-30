import os
import sys
import django

# Setup Django
sys.path.append(r"d:\Project_Intership\EDA\stock_project")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from stocks.views import resolve_yahoo_symbol

test_cases = [
    ("L&T", "india200", "LT.NS"),
    ("L&T.NS", "india200", "LT.NS"),
    ("BRK.B", "usa200", "BRK-B"),
    ("BRK.A", "usa200", "BRK-A"),
    ("TATAMOTORS", "india200", "TATAMOTORS.NS"),
    ("RELIANCE", "india200", "RELIANCE.NS"),
    ("AAPL", "usa200", "AAPL"),
]

print("Testing Symbol Resolution:")
for sym, p_id, expected in test_cases:
    resolved = resolve_yahoo_symbol(sym, p_id)
    print(f"Input: {sym} ({p_id}) -> Resolved: {resolved} (Expected: {expected})")
    assert resolved == expected

print("\nAll symbol tests passed!")
