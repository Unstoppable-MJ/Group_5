import os
import sys
import django
import traceback

sys.path.append('d:/Project_Intership/EDA/stock_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from portfolio.models import Portfolio
from stocks.models import PortfolioStock
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

def run_test():
    p = Portfolio.objects.first()
    if not p:
        print("No portfolio found")
        return
        
    stocks = PortfolioStock.objects.filter(portfolio=p)
    print(f'Starting with {stocks.count()} stocks for portfolio {p.name}')
    
    if stocks.count() == 0:
        print('No stocks to process')
        return

    data = []
    for s in stocks:
        data.append({
            'id': s.id,
            'symbol': s.stock.symbol,
            'current_price': float(s.current_price),
            'max_price': float(s.max_price),
            'pe_ratio': float(s.pe_ratio),
            'discount_level': float(s.discount_level),
            'opportunity': float(s.opportunity)
        })

    df_full = pd.DataFrame(data)
    features = ['current_price', 'max_price', 'pe_ratio', 'discount_level', 'opportunity']
    k = 5

    try:
        df_unique = df_full[features].drop_duplicates().reset_index(drop=True)
        scaler = StandardScaler()
        scaled_unique = scaler.fit_transform(df_unique)
        
        actual_k = min(k, len(df_unique))
        print(f"actual_k: {actual_k}")
        
        if actual_k > 0:
            kmeans = KMeans(n_clusters=actual_k, random_state=42, n_init='auto')
            df_unique['cluster'] = kmeans.fit_predict(scaled_unique)
        else:
            df_unique['cluster'] = 0

        df = df_full.merge(df_unique, on=features, how='left')
        
        if df['cluster'].isnull().any():
            print("WARNING: NaNs found in cluster column after merge!")
            print(df[df['cluster'].isnull()])
            
        df['cluster'] = df['cluster'].fillna(0).astype(int)
        
        print('SUCCESS! Clusters found:')
        print(df[['symbol', 'cluster']].head(10))
    except Exception as e:
        print("EXCEPTION OCCURRED:", e)
        traceback.print_exc()

if __name__ == '__main__':
    run_test()
