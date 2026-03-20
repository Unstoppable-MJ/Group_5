import os, sys, django
sys.path.append('d:/Project_Intership/EDA/stock_project')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from stocks.models import PortfolioStock
from django.db.models import Count

dups = PortfolioStock.objects.values('portfolio_id', 'stock_id').annotate(c=Count('id')).filter(c__gt=1)

for d in dups:
    pid = d['portfolio_id']
    sid = d['stock_id']
    
    records = list(PortfolioStock.objects.filter(portfolio_id=pid, stock_id=sid).order_by('id'))
    if len(records) > 1:
        first = records[0]
        total_qty = float(first.quantity)
        total_investment = float(first.buy_price) * total_qty
        
        for r in records[1:]:
            qty = float(r.quantity)
            total_qty += qty
            total_investment += float(r.buy_price) * qty
            r.delete()
            
        first.quantity = total_qty
        first.buy_price = total_investment / total_qty if total_qty > 0 else 0
        first.save()
        print(f"Merged {len(records)} records for portfolio {pid}, stock {sid}")

print("Deduplication logic complete")
