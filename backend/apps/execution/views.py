from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.http import FileResponse, HttpResponse
from jobs.models import Job
from .services import execute_job
from rest_framework import status
from .models import Execution
from .serializers import ExecutionSerializer
from .pdf_service import generate_execution_pdf
import os


class ExecuteJobAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        model_name = request.data.get("model")

        if not model_name:
            return Response({"error": "Model is required"}, status=400)

        try:
            job = Job.objects.get(id=job_id, user=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=404)

        execution = execute_job(job, model_name)

        return Response({
            "execution_id": execution.id,
            "status": execution.status
        })

class ExecutionListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        executions = Execution.objects.filter(
            job__user=request.user
        ).order_by('-started_at')
        
        data = ExecutionSerializer(executions, many=True).data
        return Response(data)

class ExecutionDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, execution_id):
        try:
            execution = Execution.objects.get(
                id=execution_id,
                job__user=request.user
            )
            return Response(ExecutionSerializer(execution).data)
        except Execution.DoesNotExist:
            return Response({"error": "Execution not found"}, status=404)

class DownloadExecutionPDFAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, execution_id):
        report_type = request.query_params.get('type', 'detailed')
        
        try:
            execution = Execution.objects.get(
                id=execution_id,
                job__user=request.user
            )

            # Generate fresh PDF based on type
            # We don't save to report_file here as there's only one slot currently 
            # and it might vary by type requested.
            file_path = generate_execution_pdf(execution, report_type=report_type)
            
            # Send the file
            filename = f"AI_Workflow_{report_type.capitalize()}_Report_{execution.id}.pdf"
            
            return FileResponse(
                open(file_path, "rb"),
                as_attachment=True,
                filename=filename,
                content_type='application/pdf'
            )

        except Execution.DoesNotExist:
             return Response({"error": "Execution not found or access denied"}, status=404)
        except Exception as e:
            return HttpResponse(f"Report Generation Error: {str(e)}", status=500)
