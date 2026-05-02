from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, F
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer, CreateMessageSerializer
from accounts.models import User
from cases.models import Case


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_conversations(request):
    """List all conversations for the current user"""
    user = request.user
    
    if user.role == 'customer':
        conversations = Conversation.objects.filter(customer=user, is_active=True)
    elif user.role == 'advocate':
        conversations = Conversation.objects.filter(advocate=user, is_active=True)
    else:
        return Response({'error': 'Invalid user role for messaging'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = ConversationSerializer(conversations, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def start_conversation(request, advocate_id):
    """Start a new conversation with an advocate"""
    user = request.user
    
    if user.role != 'customer':
        return Response({'error': 'Only customers can start conversations'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        advocate = User.objects.get(id=advocate_id, role='advocate', approval_status='approved')
    except User.DoesNotExist:
        return Response({'error': 'Advocate not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Check if conversation already exists
    conversation, created = Conversation.objects.get_or_create(
        customer=user,
        advocate=advocate,
        defaults={'is_active': True}
    )
    
    serializer = ConversationSerializer(conversation, context={'request': request})
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_conversation(request, conversation_id):
    """Get conversation details and messages"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Check if user is part of this conversation
        if user.role == 'customer' and conversation.customer != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'advocate' and conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_case(request, conversation_id):
    """Customer requests to create a case from conversation"""
    from django.utils import timezone
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only customer can request case creation
        if user.role != 'customer' or conversation.customer != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'active':
            return Response({'error': 'Case already requested or created'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update conversation status and store case details
        conversation.status = 'case_requested'
        conversation.case_details = request.data.get('case_details', {})
        conversation.save()
        
        # Send system message to advocate
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Request: Customer has requested to create a case. Please review the details and confirm.",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_case(request, conversation_id):
    """Advocate confirms and creates a case from conversation"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only advocate can confirm case creation
        if user.role != 'advocate' or conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'case_requested':
            return Response({'error': 'No case requested or already confirmed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the case
        case_data = conversation.case_details or {}
        case = Case.objects.create(
            title=case_data.get('title', f'Case from conversation with {conversation.customer.name}'),
            case_type=case_data.get('case_type', 'general'),
            description=case_data.get('description', 'Case created from conversation'),
            customer=conversation.customer,
            advocate=conversation.advocate,
            status='filed',
            filing_date=timezone.now().date(),
            **{k: v for k, v in case_data.items() if k not in ['title', 'case_type', 'description']}
        )
        
        # Update conversation
        conversation.status = 'case_created'
        conversation.case_id = case.id
        conversation.advocate_notes = request.data.get('advocate_notes', '')
        conversation.save()
        
        # Send system message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Created: Case #{case.id} has been created successfully. Case ID: {case.id}",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'case_id': str(case.id),
            'message': 'Case created successfully'
        })
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_case(request, conversation_id):
    """Advocate rejects case request"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only advocate can reject case request
        if user.role != 'advocate' or conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'case_requested':
            return Response({'error': 'No case requested to reject'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update conversation back to active
        conversation.status = 'active'
        conversation.advocate_notes = request.data.get('advocate_notes', '')
        conversation.save()
        
        # Send system message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Rejected: Advocate has declined to take this case. Reason: {request.data.get('reason', 'No reason provided')}",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'message': 'Case request rejected'
        })
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_message(request, conversation_id):
    """Send a message in a conversation"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Check if user is part of this conversation
        if user.role == 'customer' and conversation.customer != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'advocate' and conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = CreateMessageSerializer(data=request.data)
        if serializer.is_valid():
            message = Message.objects.create(
                conversation=conversation,
                sender=user,
                content=serializer.validated_data['content']
            )
            
            # Update conversation timestamp
            conversation.save()
            
            message_serializer = MessageSerializer(message, context={'request': request})
            return Response(message_serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_case(request, conversation_id):
    """Customer requests to create a case from conversation"""
    from django.utils import timezone
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only customer can request case creation
        if user.role != 'customer' or conversation.customer != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'active':
            return Response({'error': 'Case already requested or created'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update conversation status and store case details
        conversation.status = 'case_requested'
        conversation.case_details = request.data.get('case_details', {})
        conversation.save()
        
        # Send system message to advocate
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Request: Customer has requested to create a case. Please review the details and confirm.",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_case(request, conversation_id):
    """Advocate confirms and creates a case from conversation"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only advocate can confirm case creation
        if user.role != 'advocate' or conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'case_requested':
            return Response({'error': 'No case requested or already confirmed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the case
        case_data = conversation.case_details or {}
        case = Case.objects.create(
            title=case_data.get('title', f'Case from conversation with {conversation.customer.name}'),
            case_type=case_data.get('case_type', 'general'),
            description=case_data.get('description', 'Case created from conversation'),
            customer=conversation.customer,
            advocate=conversation.advocate,
            status='filed',
            filing_date=timezone.now().date(),
            **{k: v for k, v in case_data.items() if k not in ['title', 'case_type', 'description']}
        )
        
        # Update conversation
        conversation.status = 'case_created'
        conversation.case_id = case.id
        conversation.advocate_notes = request.data.get('advocate_notes', '')
        conversation.save()
        
        # Send system message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Created: Case #{case.id} has been created successfully. Case ID: {case.id}",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'case_id': str(case.id),
            'message': 'Case created successfully'
        })
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_case(request, conversation_id):
    """Advocate rejects case request"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only advocate can reject case request
        if user.role != 'advocate' or conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'case_requested':
            return Response({'error': 'No case requested to reject'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update conversation back to active
        conversation.status = 'active'
        conversation.advocate_notes = request.data.get('advocate_notes', '')
        conversation.save()
        
        # Send system message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Rejected: Advocate has declined to take this case. Reason: {request.data.get('reason', 'No reason provided')}",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'message': 'Case request rejected'
        })
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_messages_read(request, conversation_id):
    """Mark all messages as read for the current user"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Check if user is part of this conversation
        if user.role == 'customer' and conversation.customer != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        elif user.role == 'advocate' and conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        # Mark unread messages as read
        unread_messages = conversation.messages.filter(is_read=False).exclude(sender=user)
        count = unread_messages.count()
        unread_messages.update(is_read=True, read_at=F('read_at'))
        
        return Response({'marked_read_count': count})
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def request_case(request, conversation_id):
    """Customer requests to create a case from conversation"""
    from django.utils import timezone
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only customer can request case creation
        if user.role != 'customer' or conversation.customer != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'active':
            return Response({'error': 'Case already requested or created'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update conversation status and store case details
        conversation.status = 'case_requested'
        conversation.case_details = request.data.get('case_details', {})
        conversation.save()
        
        # Send system message to advocate
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Request: Customer has requested to create a case. Please review the details and confirm.",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response(serializer.data)
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def confirm_case(request, conversation_id):
    """Advocate confirms and creates a case from conversation"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only advocate can confirm case creation
        if user.role != 'advocate' or conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'case_requested':
            return Response({'error': 'No case requested or already confirmed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create the case
        case_data = conversation.case_details or {}
        case = Case.objects.create(
            title=case_data.get('title', f'Case from conversation with {conversation.customer.name}'),
            case_type=case_data.get('case_type', 'general'),
            description=case_data.get('description', 'Case created from conversation'),
            customer=conversation.customer,
            advocate=conversation.advocate,
            status='filed',
            filing_date=timezone.now().date(),
            **{k: v for k, v in case_data.items() if k not in ['title', 'case_type', 'description']}
        )
        
        # Update conversation
        conversation.status = 'case_created'
        conversation.case_id = case.id
        conversation.advocate_notes = request.data.get('advocate_notes', '')
        conversation.save()
        
        # Send system message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Created: Case #{case.id} has been created successfully. Case ID: {case.id}",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'case_id': str(case.id),
            'message': 'Case created successfully'
        })
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_case(request, conversation_id):
    """Advocate rejects case request"""
    user = request.user
    
    try:
        conversation = Conversation.objects.get(id=conversation_id, is_active=True)
        
        # Only advocate can reject case request
        if user.role != 'advocate' or conversation.advocate != user:
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if conversation.status != 'case_requested':
            return Response({'error': 'No case requested to reject'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update conversation back to active
        conversation.status = 'active'
        conversation.advocate_notes = request.data.get('advocate_notes', '')
        conversation.save()
        
        # Send system message
        Message.objects.create(
            conversation=conversation,
            sender=user,
            content=f"Case Rejected: Advocate has declined to take this case. Reason: {request.data.get('reason', 'No reason provided')}",
        )
        
        serializer = ConversationSerializer(conversation, context={'request': request})
        return Response({
            'conversation': serializer.data,
            'message': 'Case request rejected'
        })
        
    except Conversation.DoesNotExist:
        return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
