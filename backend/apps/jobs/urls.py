from django.urls import path
from .views import CreateJobAPIView, ListJobsAPIView, JobDetailAPIView, DashboardStatsAPIView

urlpatterns = [
    path("", ListJobsAPIView.as_view()),
    path("stats/", DashboardStatsAPIView.as_view()),
    path("create/", CreateJobAPIView.as_view()),
    path("<int:job_id>/", JobDetailAPIView.as_view()),
]
