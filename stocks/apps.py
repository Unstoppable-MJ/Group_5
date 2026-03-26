from django.apps import AppConfig
import threading
import sys

class StocksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stocks'

    def ready(self):
        # Background sync has been disabled per user request.
        # Data is now fetched on-demand per portfolio.
        pass
