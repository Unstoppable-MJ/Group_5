import urllib.request
import json
import socket

def test_api():
    try:
        url = 'http://127.0.0.1:8004/api/portfolio-growth/?portfolio_id=india200'
        res = urllib.request.urlopen(url)
        data = json.loads(res.read().decode())
        if not data:
            print("Empty response")
            return
        
        print(f"Total points: {len(data)}")
        print(f"Start date: {data[0]['date']}")
        print(f"End date: {data[-1]['date']}")
        
        # Check first 5 and last 5 dates
        # print("Dates:", [d['date'] for d in data[:5]], "...", [d['date'] for d in data[-5:]])
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
