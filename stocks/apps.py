from django.apps import AppConfig
import threading
import sys

class StocksConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'stocks'

    def ready(self):
        # Only start the sync if we are running the server
        if 'runserver' in sys.argv:
            try:
                from .views import update_stock_db_batch
                import time

                def background_sync():
                    print("🚀 Starting Production Stock Data Sync...")
                    while True:
                        try:
                            update_stock_db_batch()
                        except Exception as e:
                            print(f"❌ Sync Error: {e}")
                        # Sleep for 5 minutes (300s) as per final production request
                        time.sleep(300)

                threading.Thread(target=background_sync, daemon=True).start()
            except ImportError:
                pass
