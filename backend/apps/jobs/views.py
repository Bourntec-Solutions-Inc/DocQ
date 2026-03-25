from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services import create_job_with_files
from .models import Job
from .serializers import JobSerializer
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone


class CreateJobAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = request.data.get("name")
        files = request.FILES.getlist("files")

        if not name or not files:
            return Response(
                {"error": "Name and files are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            job = create_job_with_files(request.user, name, files)
            return Response(JobSerializer(job).data)

        except Exception as e:
            return Response({"error": str(e)}, status=400)


class ListJobsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(user=request.user).order_by("-created_at")
        return Response(JobSerializer(jobs, many=True).data)


class JobDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, user=request.user)
            from execution.models import Execution
            from execution.serializers import ExecutionSerializer
            
            executions = Execution.objects.filter(job=job).order_by('-started_at')
            
            # Aggregate Stats
            total = executions.count()
            manual = executions.filter(trigger_type="MANUAL").count()
            scheduled = executions.filter(trigger_type="SCHEDULED").count()
            success = executions.filter(status="SUCCESS").count()
            failed = executions.filter(status__in=["FAILED", "BLOCKED"]).count()
            
            # Enrich execution data with logs
            execution_data = []
            for ex in executions[:10]: # Return last 10 for performance
                edata = {
                   "id": ex.id,
                   "status": ex.status,
                   "trigger_type": ex.trigger_type,
                   "started_at": ex.started_at,
                   "completed_at": ex.completed_at,
                   "logs": [{"message": l.message, "level": l.level, "time": l.timestamp} for l in ex.logs.all().order_by('timestamp')]
                }
                execution_data.append(edata)

            data = JobSerializer(job).data
            data['analytics'] = {
                "total_executions": total,
                "manual_count": manual,
                "scheduled_count": scheduled,
                "success_count": success,
                "failed_count": failed,
                "history": execution_data
            }
            return Response(data)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

    def patch(self, request, job_id):
        try:
            job = Job.objects.get(id=job_id, user=request.user)
            if "is_archived" in request.data:
                job.is_archived = request.data["is_archived"]
            if "name" in request.data:
                job.name = request.data["name"]
            job.save()
            return Response(JobSerializer(job).data)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

class DashboardStatsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        from execution.models import Execution
        from scheduler.models import JobSchedule

        active_jobs = Job.objects.filter(user=user, is_archived=False).count()
        
        all_execs = Execution.objects.filter(job__user=user).order_by('-started_at')
        total_executions = all_execs.count()
        usage_limit = 500  # Example limit for Pro plan
        usage_percent = min(100, (total_executions / usage_limit) * 100) if usage_limit > 0 else 0

        last_status = "STABLE"
        if all_execs.exists():
            last_status = all_execs.first().status
            
        alerts = all_execs.filter(status="FAILED").count()

        # Next Scheduled (find earliest incoming across all users active schedules)
        next_run_str = "N/A"
        earliest_schedule = JobSchedule.objects.filter(job__user=user, is_active=True, job__is_archived=False).order_by('next_run').first()
        if earliest_schedule and earliest_schedule.next_run:
            next_run_str = earliest_schedule.next_run.strftime("%I:%M %p")
        elif earliest_schedule:
            next_run_str = earliest_schedule.run_time.strftime("%I:%M %p")
        
        # Live Activity Feed (Aggregated)
        feed = []
        for ex in all_execs[:5]:
            feed.append({
                "type": "EXECUTION",
                "status": ex.status,
                "title": ex.job.name,
                "description": f"Processed via {ex.model_used}",
                "time": ex.started_at
            })
            
        for job in Job.objects.filter(user=user).order_by('-created_at')[:3]:
            feed.append({
                "type": "NEW_JOB",
                "status": "INFO",
                "title": "Configured Workflow",
                "description": f"Job '{job.name}' ready.",
                "time": job.created_at
            })
            
        # Final sort returning newest 6 logs
        feed.sort(key=lambda x: x["time"] if x["time"] else timezone.now(), reverse=True)
        feed = feed[:6]

        return Response({
            "stats": {
                "active_jobs": active_jobs,
                "last_execution": last_status,
                "next_scheduled": next_run_str,
                "alerts": alerts,
                "total_executions": total_executions,
                "usage_limit": usage_limit,
                "usage_percent": round(usage_percent, 1)
            },
            "activity": feed
        })
