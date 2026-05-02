import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Conversation(models.Model):
    """Conversation between a customer and an advocate"""
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('case_requested', 'Case Requested'),
        ('case_confirmed', 'Case Confirmed'),
        ('case_created', 'Case Created'),
        ('closed', 'Closed'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_conversations')
    advocate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='advocate_conversations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Case related fields
    case_id = models.UUIDField(null=True, blank=True, help_text='ID of the created case')
    case_details = models.JSONField(null=True, blank=True, help_text='Case details when case is requested')
    advocate_notes = models.TextField(null=True, blank=True, help_text='Advocate notes about the case')

    class Meta:
        ordering = ['-updated_at']
        constraints = [
            models.UniqueConstraint(fields=['customer', 'advocate'], name='unique_customer_advocate_conversation')
        ]

    def __str__(self):
        return f"Conversation: {self.customer.name} - {self.advocate.name} ({self.status})"


class Message(models.Model):
    """Individual message within a conversation"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"Message from {self.sender.name} in {self.conversation}"


class MessageAttachment(models.Model):
    """File attachments for messages"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='message_attachments/')
    filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.message}"
