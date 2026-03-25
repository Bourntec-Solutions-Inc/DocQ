from apscheduler.schedulers.background import BackgroundScheduler
from django.utils import timezone
from .models import JobSchedule
from execution.services import execute_job
import datetime
import logging

logger = logging.getLogger(__name__)
scheduler = BackgroundScheduler()


def run_scheduled_jobs():
    """Check and run jobs that are due for execution"""
    now = timezone.localtime()
    # Find active schedules where current time matches run_time (hour/minute)
    schedules = JobSchedule.objects.filter(is_active=True)

    for schedule in schedules:
        if (schedule.run_time.hour == now.hour and 
            schedule.run_time.minute == now.minute):
            
            # Simple debounce: Don't run if it ran in the last 60 seconds
            if schedule.last_run and (now - schedule.last_run).total_seconds() < 60:
                continue

            logger.info(f"Triggering Scheduled Job: {schedule.job.name}")
            execute_job(schedule.job, schedule.model_used, trigger_type="SCHEDULED")

            schedule.last_run = now
            schedule.next_run = now + datetime.timedelta(days=1)
            schedule.save()


def start():
    # misfire_grace_time=60 gives the scheduler 60 seconds to catch up if it misses a trigger
    # coalesce=True prevents queuing up multiple instances if the machine lags
    scheduler.add_job(
        run_scheduled_jobs, 
        "interval", 
        minutes=1, 
        misfire_grace_time=60, 
        coalesce=True,
        id="run_scheduled_jobs",
        replace_existing=True
    )
    if not scheduler.running:
        scheduler.start()
        logger.info("APScheduler Initialized with 60s Misfire Grace Window.")
