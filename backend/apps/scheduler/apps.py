from django.apps import AppConfig


class SchedulerConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.scheduler"

    def ready(self):
        import sys
        # Only start scheduler if we are running the server
        if 'runserver' in sys.argv:
            try:
                from .scheduler import start
                start()
            except Exception as e:
                print("Scheduler failed to start:", str(e))
