from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class Portfolio(models.Model):
    PORTFOLIO_TYPE_CHOICES = (
        ('standard', 'Standard'),
        ('ai_builtin', 'AI Built-in'),
        ('ai_custom', 'AI Custom'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    portfolio_type = models.CharField(max_length=20, choices=PORTFOLIO_TYPE_CHOICES, default='standard')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name