from django.db import models
from apps.common.models import BaseModel
from apps.jobs.models import Job


class JobSchedule(BaseModel):
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name="schedule")

    run_time = models.TimeField()  # Daily run time
    is_active = models.BooleanField(default=True)

    last_run = models.DateTimeField(null=True, blank=True)
    next_run = models.DateTimeField(null=True, blank=True)

    model_used = models.CharField(max_length=20, default="BournAI")

    def __str__(self):
        return f"Schedule for Job {self.job.id}"
