import time

from django.core.management.base import BaseCommand

from stocks.views import update_stock_db_batch


class Command(BaseCommand):
    help = "Sync cached stock data once or continuously for production deployments."

    def add_arguments(self, parser):
        parser.add_argument(
            "--loop",
            action="store_true",
            help="Keep syncing on an interval instead of running once.",
        )
        parser.add_argument(
            "--interval",
            type=int,
            default=300,
            help="Seconds to wait between sync runs when using --loop.",
        )

    def handle(self, *args, **options):
        def run_sync():
            self.stdout.write("Starting stock data sync...")
            update_stock_db_batch()
            self.stdout.write(self.style.SUCCESS("Stock data sync completed."))

        if not options["loop"]:
            run_sync()
            return

        interval = max(options["interval"], 60)
        self.stdout.write(
            f"Running stock data sync in loop mode every {interval} seconds."
        )

        while True:
            try:
                run_sync()
            except Exception as exc:
                self.stderr.write(f"Stock data sync failed: {exc}")
            time.sleep(interval)
