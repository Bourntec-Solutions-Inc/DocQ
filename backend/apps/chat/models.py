from django.db import models
from common.models import BaseModel
from jobs.models import Job
from execution.models import Execution


class ChatSession(BaseModel):
    job = models.ForeignKey(
        Job, on_delete=models.CASCADE, related_name="chat_sessions"
    )
    # Optional execution focus
    execution = models.ForeignKey(
        Execution,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="chat_sessions"
    )
    title = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"ChatSession {self.id} for {self.job.name}"


class ChatMessage(BaseModel):
    ROLE_CHOICES = [
        ("USER", "USER"),
        ("AI", "AI"),
    ]

    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()

    def __str__(self):
        return f"{self.role} - {self.id}"
