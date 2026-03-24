from .models import Job, JobFile
from django.db import transaction
from .utils import validate_txt_file


def create_job_with_files(user, name, files):
    with transaction.atomic():
        job = Job.objects.create(name=name, user=user)

        for file in files:
            validate_txt_file(file)

            JobFile.objects.create(
                job=job,
                file=file,
                file_name=file.name
            )

    return job
