from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from jobs.models import Job
from .models import JobSchedule
from rest_framework import status


class CreateScheduleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        run_time = request.data.get("run_time")  # "14:30"
        model = request.data.get("model", "BournAI")

        if not run_time:
            return Response({"error": "run_time required"}, status=400)

        try:
            job = Job.objects.get(id=job_id, user=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        hour, minute = map(int, run_time.split(":"))

        schedule, created = JobSchedule.objects.update_or_create(
            job=job,
            defaults={
                "run_time": f"{hour:02d}:{minute:02d}",
                "model_used": model,
                "is_active": True
            }
        )

        return Response({
            "message": "Schedule set successfully",
            "run_time": run_time
        })
