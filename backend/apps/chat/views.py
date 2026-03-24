from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.jobs.models import Job
from apps.execution.models import Execution
from .models import ChatSession, ChatMessage
from .services import build_execution_context, build_job_context
from .ai_service import generate_chat_response
from .serializers import ChatSessionSerializer, ChatMessageSerializer


class ChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        job_id = request.data.get("job_id")
        execution_id = request.data.get("execution_id")
        message = request.data.get("message")
        model = request.data.get("model", "BournAI")
        session_id = request.data.get("session_id")

        if not job_id or not message:
            return Response({"error": "Missing job_id or message"}, status=400)

        try:
            job = Job.objects.get(id=job_id, user=request.user)
        except Job.DoesNotExist:
            return Response({"error": "Workflow not found"}, status=404)

        # Get or create session
        if session_id:
            try:
                session = ChatSession.objects.get(id=session_id, job=job)
            except ChatSession.DoesNotExist:
                return Response({"error": "Session not found"}, status=404)
        else:
            # First message in session - use it for title
            session = ChatSession.objects.create(job=job, title=message[:50])

        # Link execution if provided
        if execution_id and not session.execution:
            try:
                ex = Execution.objects.get(id=execution_id, job=job)
                session.execution = ex
                session.save()
            except Execution.DoesNotExist:
                pass

        # Save user message
        ChatMessage.objects.create(session=session, role="USER", content=message)

        # Build context (Job files + optionally execution results)
        if session.execution:
            context = build_execution_context(session.execution)
        else:
            context = build_job_context(job)

        # Get AI response
        ai_response = generate_chat_response(model, context, message)

        # Save AI message
        ChatMessage.objects.create(session=session, role="AI", content=ai_response)

        return Response({
            "session_id": session.id,
            "response": ai_response,
            "title": session.title
        })

class ChatHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, session_id):
        try:
            session = ChatSession.objects.get(id=session_id, job__user=request.user)
            messages = session.messages.all().order_by('created_at')
            return Response({
                "id": session.id,
                "title": session.title,
                "messages": ChatMessageSerializer(messages, many=True).data
            })
        except ChatSession.DoesNotExist:
            return Response({"error": "Session not found"}, status=404)

class JobChatSessionsAPIView(APIView):
    """List all chat sessions for a specific workflow"""
    permission_classes = [IsAuthenticated]

    def get(self, request, job_id):
        sessions = ChatSession.objects.filter(job_id=job_id, job__user=request.user).order_by('-created_at')
        return Response(ChatSessionSerializer(sessions, many=True).data)
