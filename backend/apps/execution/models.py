from django.db import models
from common.models import BaseModel
from jobs.models import Job, JobFile


class Execution(BaseModel):
    STATUS_CHOICES = [
        ("PENDING", "PENDING"),
        ("RUNNING", "RUNNING"),
        ("SUCCESS", "SUCCESS"),
        ("FAILED", "FAILED"),
        ("BLOCKED", "BLOCKED"),
    ]

    MODEL_CHOICES = [
        ("BournAI", "BournAI"),
    ]

    TRIGGER_CHOICES = [
        ("MANUAL", "MANUAL"),
        ("SCHEDULED", "SCHEDULED"),
    ]

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="executions")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    model_used = models.CharField(max_length=20, choices=MODEL_CHOICES)
    trigger_type = models.CharField(max_length=20, choices=TRIGGER_CHOICES, default="MANUAL", null=True, blank=True)

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    report_file = models.FileField(upload_to="reports/", null=True, blank=True)

    def __str__(self):
        return f"Execution {self.id} - {self.status}"


class ExecutionResult(BaseModel):
    execution = models.ForeignKey(
        Execution, on_delete=models.CASCADE, related_name="results"
    )
    job_file = models.ForeignKey(JobFile, on_delete=models.CASCADE)

    prompt = models.TextField()
    response = models.TextField()

    def __str__(self):
        return f"Result {self.id}"

class ExecutionLog(BaseModel):
    execution = models.ForeignKey(Execution, on_delete=models.CASCADE, related_name="logs")
    message = models.TextField()
    level = models.CharField(max_length=20, default="INFO") # INFO, ERROR, SUCCESS
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Log for {self.execution_id}: {self.message[:50]}"
