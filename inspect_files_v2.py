import pandas as pd
import json

info = {}

try:
    df_india = pd.read_csv('ind_nifty200list.csv')
    info['india'] = {
        'columns': df_india.columns.tolist(),
        'head': df_india[['Company Name', 'Symbol']].head().to_dict(orient='records')
    }
except Exception as e:
    info['india_error'] = str(e)

try:
    df_usa = pd.read_excel('USA Top 200 Stocks.xlsx')
    info['usa'] = {
        'columns': df_usa.columns.tolist(),
        'head': df_usa.head().to_dict(orient='records')
    }
except Exception as e:
    info['usa_error'] = str(e)

with open('file_info.json', 'w') as f:
    json.dump(info, f, indent=2)
