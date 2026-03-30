import pandas as pd

print("--- ind_nifty200list.csv ---")
try:
    df_india = pd.read_csv('ind_nifty200list.csv')
    print("Columns:", df_india.columns.tolist())
    print(df_india[['Company Name', 'Symbol']].head())
except Exception as e:
    print("Error reading India CSV:", e)

print("\n--- USA Top 200 Stocks.xlsx ---")
try:
    df_usa = pd.read_excel('USA Top 200 Stocks.xlsx')
    print("Columns:", df_usa.columns.tolist())
    # Assuming columns based on typical financial data
    print(df_usa.head())
except Exception as e:
    print("Error reading USA Excel:", e)
