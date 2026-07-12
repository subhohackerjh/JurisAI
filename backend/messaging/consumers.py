"""
WebSocket consumer for real-time chat between customer and advocate.
Each conversation gets its own channel group: chat_<conversation_id>
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'chat_{self.conversation_id}'
        self.user = self.scope.get('user')

        # Reject unauthenticated connections
        if not self.user or not self.user.is_authenticated:
            await self.close(code=4001)
            return

        # Verify user belongs to this conversation
        allowed = await self.user_in_conversation(self.conversation_id, self.user)
        if not allowed:
            await self.close(code=4003)
            return

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Mark unread messages as read on connect
        await self.mark_messages_read(self.conversation_id, self.user)

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        msg_type = data.get('type', 'message')

        if msg_type == 'message':
            content = data.get('content', '').strip()
            if not content:
                return

            # Save to DB
            message = await self.save_message(self.conversation_id, self.user, content)
            if not message:
                return

            # Broadcast to everyone in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': {
                        'id': str(message['id']),
                        'content': message['content'],
                        'sender_id': str(self.user.id),
                        'sender_name': self.user.name,
                        'sender_role': self.user.role,
                        'timestamp': message['timestamp'],
                        'is_read': False,
                    }
                }
            )

        elif msg_type == 'typing':
            # Broadcast typing indicator to the other person only
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'sender_id': str(self.user.id),
                    'sender_name': self.user.name,
                    'is_typing': data.get('is_typing', False),
                }
            )

        elif msg_type == 'read':
            # Mark messages read + broadcast receipt
            count = await self.mark_messages_read(self.conversation_id, self.user)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'messages_read',
                    'reader_id': str(self.user.id),
                    'count': count,
                }
            )

    # ── Group event handlers ──────────────────────────────────────────────────

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            **event['message'],
        }))

    async def typing_indicator(self, event):
        # Don't send back to the person who triggered it
        if str(self.user.id) != event['sender_id']:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'sender_id': event['sender_id'],
                'sender_name': event['sender_name'],
                'is_typing': event['is_typing'],
            }))

    async def messages_read(self, event):
        await self.send(text_data=json.dumps({
            'type': 'read',
            'reader_id': event['reader_id'],
            'count': event['count'],
        }))

    async def conversation_updated(self, event):
        """Notify when conversation status changes (case request/confirm/reject)."""
        await self.send(text_data=json.dumps({
            'type': 'conversation_updated',
            'status': event['status'],
            'case_id': event.get('case_id'),
        }))

    # ── DB helpers (run in thread pool) ──────────────────────────────────────

    @database_sync_to_async
    def user_in_conversation(self, conversation_id, user):
        from .models import Conversation
        try:
            conv = Conversation.objects.get(id=conversation_id, is_active=True)
            return (user.role in ('customer', 'student') and conv.customer_id == user.id) or \
                   (user.role == 'advocate' and conv.advocate_id == user.id)
        except Conversation.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, conversation_id, user, content):
        from .models import Conversation, Message
        try:
            conv = Conversation.objects.get(id=conversation_id, is_active=True)
            msg = Message.objects.create(conversation=conv, sender=user, content=content)
            conv.updated_at = timezone.now()
            conv.save(update_fields=['updated_at'])
            return {
                'id': msg.id,
                'content': msg.content,
                'timestamp': msg.timestamp.isoformat(),
            }
        except Conversation.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_messages_read(self, conversation_id, user):
        from .models import Conversation
        from django.utils import timezone
        try:
            conv = Conversation.objects.get(id=conversation_id)
            unread = conv.messages.filter(is_read=False).exclude(sender=user)
            count = unread.count()
            unread.update(is_read=True, read_at=timezone.now())
            return count
        except Conversation.DoesNotExist:
            return 0
