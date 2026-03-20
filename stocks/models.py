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
    pe_ratio = models.FloatField()
    max_price = models.FloatField(default=0)

    discount_level = models.FloatField(default=0)
    opportunity = models.FloatField(default=0)

    def __str__(self):
        return f"{self.portfolio.name} - {self.stock.symbol}"