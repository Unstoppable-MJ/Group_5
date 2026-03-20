import os
import sys
import django

sys.path.append('d:/Project_Intership/EDA/stock_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from portfolio.models import Portfolio
from stocks.models import Stock, PortfolioStock
import yfinance as yf

def add_stock_to_portfolio(symbol, portfolio, buy_price, quantity):
    print(f"Adding {symbol}...")
    try:
        # Get or create stock
        yahoo_symbol = symbol if symbol.endswith(".NS") else symbol + ".NS"
        stock, created = Stock.objects.get_or_create(
            symbol=yahoo_symbol,
            defaults={'name': symbol, 'sector': 'Unknown'}
        )
        
        # Fetch current data for metrics
        ticker = yf.Ticker(yahoo_symbol)
        info = ticker.info
        current_price = info.get("currentPrice") or info.get("regularMarketPrice") or 0
        max_price = info.get("fiftyTwoWeekHigh") or current_price
        pe_ratio = info.get("trailingPE") or 0
        
        if current_price == 0:
            print(f"Skipping {symbol} - no price found")
            return

        discount_level = ((max_price - current_price) / max_price) * 100 if max_price else 0
        opportunity = (discount_level * 0.4) + (100 / (pe_ratio + 1)) * 0.6 if pe_ratio else 0

        PortfolioStock.objects.create(
            portfolio=portfolio,
            stock=stock,
            buy_price=buy_price,
            quantity=quantity,
            current_price=current_price,
            max_price=max_price,
            pe_ratio=pe_ratio,
            discount_level=discount_level,
            opportunity=opportunity
        )
        print(f"Successfully added {symbol}!")
    except Exception as e:
        print(f"Error adding {symbol}: {e}")

if __name__ == '__main__':
    # Get the first portfolio, create if it doesn't exist
    portfolio = Portfolio.objects.first()
    if not portfolio:
         portfolio = Portfolio.objects.create(name="Main Portfolio", description="Test")
    
    # Stocks to add to reach the >3 threshold for clustering
    stocks_to_add = [
        ("INFY.NS", 100000, 50),
        ("HDFCBANK.NS", 150000, 100),
        ("ITC.NS", 50000, 120),
        ("RELIANCE.NS", 200000, 70),
        ("WIPRO.NS", 60000, 150)
    ]
    
    for symbol, inv, qty in stocks_to_add:
        # Check if already in portfolio
        stock_obj = Stock.objects.filter(symbol=symbol).first()
        if stock_obj and PortfolioStock.objects.filter(portfolio=portfolio, stock=stock_obj).exists():
             print(f"{symbol} already in portfolio.")
             continue
        add_stock_to_portfolio(symbol, portfolio, inv, qty)
    
    print("Done!")
