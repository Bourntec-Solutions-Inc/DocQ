from django.urls import path
from .views import ExecuteJobAPIView, ExecutionDetailAPIView, DownloadExecutionPDFAPIView, ExecutionListAPIView

urlpatterns = [
    path("list/", ExecutionListAPIView.as_view(), name="execution-list"),
    path("<int:job_id>/run/", ExecuteJobAPIView.as_view()),
    path("result/<int:execution_id>/", ExecutionDetailAPIView.as_view()),
    path("download/<int:execution_id>/", DownloadExecutionPDFAPIView.as_view()),
]
