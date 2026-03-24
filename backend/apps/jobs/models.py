from django.db import models
from apps.common.models import BaseModel
from django.conf import settings


def job_file_upload_path(instance, filename):
    return f"jobs/{instance.job.id}/files/{filename}"


class Job(BaseModel):
    name = models.CharField(max_length=255)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class JobFile(BaseModel):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="files")
    file = models.FileField(upload_to=job_file_upload_path)
    file_name = models.CharField(max_length=255)

    def __str__(self):
        return self.file_name
