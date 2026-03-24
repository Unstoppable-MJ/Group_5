import os
import django
import sys
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from itertools import combinations

# Setup Django environment
sys.path.append(r'd:\Project_Intership\EDA\stock_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from django.conf import settings
from stocks.views import get_builtin_portfolio_stocks

def debug_clustering(portfolio_id="india200", k_param="3", auto_k=True):
    print(f"Debugging clustering for {portfolio_id}, k={k_param}, auto_k={auto_k}")
    
    try:
        k = int(k_param) if not auto_k else 3
    except:
        k = 3

    if k > 6: k = 6
    if k < 2: k = 2

    # Mocking the GET logic
    if portfolio_id in ["india200", "usa200"]:
        stocks_data = get_builtin_portfolio_stocks(portfolio_id)
        if not stocks_data:
            print("Error: No data found for this built-in portfolio.")
            return
        df = pd.DataFrame(stocks_data)
    else:
        print("This script currently tests built-in portfolios only.")
        return

    print(f"Dataframe size: {len(df)}")
    
    # Ensure numeric types (as in views.py)
    df['current_price'] = pd.to_numeric(df['current_price'], errors='coerce').fillna(0)
    df['pe_ratio'] = pd.to_numeric(df['pe_ratio'], errors='coerce').fillna(15.0)
    # Mirroring views.py fix
    df['discount_level'] = pd.to_numeric(df['discount_level'], errors='coerce').fillna(0)
    df['opportunity'] = pd.to_numeric(df['opportunity'], errors='coerce').fillna(0)

    # Apply Log Transformation
    df['log_price'] = np.log1p(df['current_price']).fillna(0)
    df['log_pe'] = np.log1p(df['pe_ratio']).fillna(0)


    core_features = ["log_price", "log_pe", "discount_level", "opportunity"]
    feature_pairs = list(combinations(core_features, 2))
    
    if auto_k and len(df) > 2:
        best_avg_score = -1.0
        best_k = 2
        for test_k in range(2, min(7, len(df))):
            temp_scores = []
            for f1, f2 in feature_pairs:
                scaler = StandardScaler()
                scaled = scaler.fit_transform(df[[f1, f2]])
                km = KMeans(n_clusters=test_k, random_state=42, n_init='auto')
                lbls = km.fit_predict(scaled)
                if len(np.unique(lbls)) > 1:
                    try:
                        s = silhouette_score(scaled, lbls)
                        temp_scores.append(s)
                    except Exception as e:
                        print(f"Silhouette failed for K={test_k}, pair={f1}_{f2}: {e}")
                        continue
            
            if temp_scores:
                avg_s = sum(temp_scores) / len(temp_scores)
                if avg_s > best_avg_score:
                    best_avg_score = avg_s
                    best_k = test_k
        actual_k = best_k
    else:
        actual_k = min(k, len(df))

    print(f"Actual K selected: {actual_k}")

    best_score = -1.0
    can_score = actual_k > 1 and len(df) > actual_k

    for idx, (f1, f2) in enumerate(feature_pairs):
        pair_features = [f1, f2]
        scaler = StandardScaler()
        scaled_features = scaler.fit_transform(df[pair_features])
        
        kmeans = KMeans(n_clusters=actual_k, random_state=42, n_init='auto')
        cluster_labels = kmeans.fit_predict(scaled_features)
        
        score = 0.0
        if can_score:
            if len(np.unique(cluster_labels)) > 1:
                score = float(silhouette_score(scaled_features, cluster_labels))
        
        print(f"Pair {f1} vs {f2}: quality score {score:.3f}")

    print("Clustering debug completed successfully.")

if __name__ == "__main__":
    debug_clustering()
