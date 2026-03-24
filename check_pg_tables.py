import psycopg2
import sys

try:
    conn = psycopg2.connect(
        dbname='chatsense_db',
        user='postgres',
        password='password',
        host='localhost',
        port='5432'
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cur.fetchall()
    
    if not tables:
        print("No tables found in the database.")
    else:
        print("Tables found in 'chatsense_db':")
        for table in sorted(tables):
            print(f"- {table[0]}")
            
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error connecting to PostgreSQL: {e}")
    sys.exit(1)
