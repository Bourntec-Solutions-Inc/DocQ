from rest_framework import serializers
from .models import Execution, ExecutionResult, ExecutionLog
from jobs.models import Job


class ExecutionResultSerializer(serializers.ModelSerializer):
    file_name = serializers.CharField(source='job_file.file_name', read_only=True)
    
    class Meta:
        model = ExecutionResult
        fields = ["id", "file_name", "prompt", "response", "created_at"]


class ExecutionLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExecutionLog
        fields = ["id", "message", "level", "timestamp"]


class ExecutionSerializer(serializers.ModelSerializer):
    results = ExecutionResultSerializer(many=True, read_only=True)
    logs = ExecutionLogSerializer(many=True, read_only=True, source='execution_logs')
    job_name = serializers.CharField(source='job.name', read_only=True)

    class Meta:
        model = Execution
        fields = [
            "id",
            "job_name",
            "status",
            "model_used",
            "trigger_type",
            "started_at",
            "completed_at",
            "results",
            "logs"
        ]
