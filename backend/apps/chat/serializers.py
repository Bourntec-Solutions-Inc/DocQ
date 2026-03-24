from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = ChatMessage
        fields = ["id", "role", "content", "time"]


class ChatSessionSerializer(serializers.ModelSerializer):
    time = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = ChatSession
        fields = ["id", "job", "execution", "title", "time"]
