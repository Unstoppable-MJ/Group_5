from django.db import models
from portfolio.models import Portfolio

class Stock(models.Model):
    name = models.CharField(max_length=100)
    symbol = models.CharField(max_length=20)
    sector = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return self.symbol


class PortfolioStock(models.Model):
    portfolio = models.ForeignKey(Portfolio, on_delete=models.CASCADE)
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)

    quantity = models.IntegerField()
    buy_price = models.FloatField()
    current_price = models.FloatField()
    pe_ratio = models.FloatField(null=True, blank=True)
    max_price = models.FloatField(null=True, blank=True)


    discount_level = models.FloatField(default=0)
    opportunity = models.FloatField(default=0)

    def __str__(self):
        return f"{self.portfolio.name} - {self.stock.symbol}"

class StockData(models.Model):
    symbol = models.CharField(max_length=20, unique=True, db_index=True)
    company_name = models.CharField(max_length=255, null=True, blank=True)
    current_price = models.FloatField(null=True, blank=True)
    pe_ratio = models.FloatField(null=True, blank=True)
    max_price_52w = models.FloatField(null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.symbol