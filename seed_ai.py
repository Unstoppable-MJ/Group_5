import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'stock_project.settings')
django.setup()

from portfolio.models import Portfolio

def seed():
    builtins = [
        {"name": "NIFTY 50 AI Portfolio", "icon": "⚡"},
        {"name": "Precious Metals AI", "icon": "🥇"},
        {"name": "Crypto AI Portfolio", "icon": "🪙"}
    ]
    
    for b in builtins:
        Portfolio.objects.get_or_create(
            name=b["name"],
            user=None,
            defaults={
                "description": f"A globally available {b['name']} powered by advanced AI forecasting.",
                "portfolio_type": "ai_builtin"
            }
        )
    print("AI Builtin Portfolios successfully seeded!")

if __name__ == '__main__':
    seed()
