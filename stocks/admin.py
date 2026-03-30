from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Stock, PortfolioStock

admin.site.register(Stock)
admin.site.register(PortfolioStock)
