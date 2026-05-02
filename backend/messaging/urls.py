from django.urls import path
from . import views

urlpatterns = [
    # Conversations
    path('conversations/', views.list_conversations, name='list_conversations'),
    path('conversations/start/<int:advocate_id>/', views.start_conversation, name='start_conversation'),
    path('conversations/<uuid:conversation_id>/', views.get_conversation, name='get_conversation'),
    
    # Messages
    path('conversations/<uuid:conversation_id>/send/', views.send_message, name='send_message'),
    path('conversations/<uuid:conversation_id>/mark-read/', views.mark_messages_read, name='mark_messages_read'),
    
    # Case Creation Workflow
    path('conversations/<uuid:conversation_id>/request-case/', views.request_case, name='request_case'),
    path('conversations/<uuid:conversation_id>/confirm-case/', views.confirm_case, name='confirm_case'),
    path('conversations/<uuid:conversation_id>/reject-case/', views.reject_case, name='reject_case'),
]
