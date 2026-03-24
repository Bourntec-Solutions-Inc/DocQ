from django.urls import path
from .views import CreateScheduleAPIView

urlpatterns = [
    path("<int:job_id>/create/", CreateScheduleAPIView.as_view()),
]
