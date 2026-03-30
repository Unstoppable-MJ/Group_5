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

from django.contrib.auth.models import User

if __name__ == '__main__':
    # Get a user to own the portfolio
    user = User.objects.first()
    if not user:
         user = User.objects.create_user(username='demo_user', password='password123')

    # Create the demo portfolio
    portfolio_name = "AI Clustering Demo"
    portfolio_desc = "Clean portfolio for K-Means demonstration"
    portfolio, created = Portfolio.objects.get_or_create(
         name=portfolio_name, 
         user=user,
         defaults={"description": portfolio_desc}
    )
    if not created:
         # Clear old stocks if it existed to ensure clean state
         PortfolioStock.objects.filter(portfolio=portfolio).delete()
         print(f"Cleared existing stocks in '{portfolio_name}'")
    else:
         print(f"Created new portfolio '{portfolio_name}'")
    
    # 5 unique stocks to add
    stocks_to_add = [
        ("TCS.NS", 3500, 10),
        ("INFY.NS", 1500, 25),
        ("HDFCBANK.NS", 1600, 30),
        ("ITC.NS", 400, 100),
        ("RELIANCE.NS", 2900, 15)
    ]
    
    for symbol, price, qty in stocks_to_add:
        add_stock_to_portfolio(symbol, portfolio, price, qty)
    
    print("Done! Demo portfolio is ready.")
