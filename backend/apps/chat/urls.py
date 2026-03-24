from django.urls import path
from .views import ChatAPIView, ChatHistoryAPIView, JobChatSessionsAPIView

urlpatterns = [
    path("", ChatAPIView.as_view(), name="chat-create"),
    path("history/<int:session_id>/", ChatHistoryAPIView.as_view(), name="chat-history"),
    path("job/<int:job_id>/sessions/", JobChatSessionsAPIView.as_view(), name="job-sessions"),
]
