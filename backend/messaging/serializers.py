from rest_framework import serializers
from .models import Conversation, Message, MessageAttachment
from accounts.serializers import UserSerializer


class MessageAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageAttachment
        fields = ['id', 'filename', 'file_size', 'uploaded_at', 'file']


class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    attachments = MessageAttachmentSerializer(read_only=True, many=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'timestamp', 'is_read', 'read_at', 'attachments']


class ConversationSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    advocate = UserSerializer(read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'customer', 'advocate',
            'created_at', 'updated_at', 'is_active',
            # Case workflow fields — REQUIRED by frontend Flow B
            'status', 'case_details', 'case_id', 'advocate_notes',
            'messages', 'unread_count',
        ]

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
        return 0


class CreateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content']
