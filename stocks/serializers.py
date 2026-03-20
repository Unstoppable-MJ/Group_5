from rest_framework import serializers
from .models import PortfolioStock
from portfolio.models import Portfolio


# ✅ ADD THIS (New)
class AddStockSerializer(serializers.Serializer):
    symbol = serializers.CharField(max_length=20)
    quantity = serializers.IntegerField(default=1, required=False)
    portfolio = serializers.PrimaryKeyRelatedField(
        queryset=Portfolio.objects.all()
    )


# 🔹 Existing serializer (unchanged)
class StockListSerializer(serializers.ModelSerializer):

    portfolio = serializers.CharField(source="portfolio.name")
    symbol = serializers.CharField(source="stock.symbol")
    company_name = serializers.CharField(source="stock.name")
    sector = serializers.CharField(source="stock.sector")

    investment_value = serializers.SerializerMethodField()
    current_value = serializers.SerializerMethodField()
    profit_loss = serializers.SerializerMethodField()

    class Meta:
        model = PortfolioStock
        fields = [
            "id",
            "portfolio",
            "symbol",
            "company_name",
            "sector",
            "quantity",
            "buy_price",
            "current_price",
            "max_price",
            "pe_ratio",
            "discount_level",      # ← add this
            "opportunity",         # ← add this
            "investment_value",
            "current_value",
            "profit_loss",
        ]

    def get_investment_value(self, obj):
        return obj.quantity * obj.buy_price

    def get_current_value(self, obj):
        return obj.quantity * obj.current_price

    def get_profit_loss(self, obj):
        return (obj.quantity * obj.current_price) - (obj.quantity * obj.buy_price)