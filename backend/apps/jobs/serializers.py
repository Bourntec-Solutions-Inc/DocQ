from rest_framework import serializers
from .models import Job, JobFile


class JobFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobFile
        fields = ["id", "file", "file_name", "created_at"]


class JobSerializer(serializers.ModelSerializer):
    files = JobFileSerializer(many=True, read_only=True)

    class Meta:
        model = Job
        fields = ["id", "name", "files", "is_archived", "created_at"]
