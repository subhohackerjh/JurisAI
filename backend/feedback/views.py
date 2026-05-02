from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Avg, Q
from django.shortcuts import get_object_or_404

from .models import Feedback, FeedbackResponse, AdvocateRating, SystemRating
from .serializers import (
    FeedbackListSerializer, FeedbackDetailSerializer, FeedbackCreateSerializer,
    FeedbackUpdateSerializer, FeedbackResponseSerializer, FeedbackResponseCreateSerializer,
    AdvocateRatingListSerializer, AdvocateRatingDetailSerializer, AdvocateRatingCreateSerializer,
    SystemRatingSerializer
)


class FeedbackListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject', 'message']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FeedbackCreateSerializer
        return FeedbackListSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            queryset = Feedback.objects.all()
        else:
            queryset = Feedback.objects.filter(user=user)
        
        # Filters
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        feedback_type = self.request.query_params.get('type')
        if feedback_type:
            queryset = queryset.filter(feedback_type=feedback_type)
        
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.select_related('user', 'assigned_to')


class FeedbackDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return FeedbackUpdateSerializer
        return FeedbackDetailSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return Feedback.objects.all()
        return Feedback.objects.filter(user=user)


class FeedbackResponseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FeedbackResponseCreateSerializer
        return FeedbackResponseSerializer
    
    def get_queryset(self):
        feedback_id = self.kwargs.get('feedback_pk')
        user = self.request.user
        
        queryset = FeedbackResponse.objects.filter(feedback_id=feedback_id)
        
        # Non-admins only see non-internal responses
        if user.role != 'admin':
            queryset = queryset.filter(is_internal=False)
        
        return queryset.select_related('responder')


class AdvocateRatingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdvocateRatingCreateSerializer
        return AdvocateRatingListSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter by advocate if provided
        advocate_id = self.request.query_params.get('advocate')
        
        if user.role == 'advocate':
            # Advocates see ratings about themselves
            queryset = AdvocateRating.objects.filter(advocate=user, is_public=True)
        elif user.role == 'customer':
            # Customers see their own ratings
            queryset = AdvocateRating.objects.filter(customer=user)
        elif user.role == 'admin':
            # Admins see all ratings
            queryset = AdvocateRating.objects.all()
        else:
            queryset = AdvocateRating.objects.filter(is_public=True)
        
        if advocate_id:
            queryset = queryset.filter(advocate_id=advocate_id)
        
        return queryset.select_related('customer', 'advocate')


class AdvocateRatingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AdvocateRatingDetailSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'advocate':
            return AdvocateRating.objects.filter(advocate=user)
        elif user.role == 'customer':
            return AdvocateRating.objects.filter(customer=user)
        elif user.role == 'admin':
            return AdvocateRating.objects.all()
        return AdvocateRating.objects.filter(is_public=True)


class SystemRatingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SystemRatingSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return SystemRating.objects.all()
        return SystemRating.objects.filter(user=user)


class SystemRatingDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SystemRatingSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            return SystemRating.objects.all()
        return SystemRating.objects.filter(user=user)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def advocate_rating_summary(request, advocate_id):
    """Get rating summary for an advocate"""
    
    ratings = AdvocateRating.objects.filter(
        advocate_id=advocate_id,
        is_public=True,
        is_verified=True
    )
    
    if not ratings.exists():
        return Response({
            'advocate_id': advocate_id,
            'average_rating': 0,
            'total_ratings': 0,
            'rating_breakdown': {},
            'category_averages': {}
        })
    
    # Calculate statistics
    avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
    total = ratings.count()
    
    # Rating breakdown
    breakdown = {}
    for i in range(1, 6):
        count = ratings.filter(rating=i).count()
        breakdown[f'{i}_star'] = {
            'count': count,
            'percentage': round((count / total) * 100, 1) if total > 0 else 0
        }
    
    # Category averages
    category_avgs = {}
    for field in ['professionalism', 'communication', 'expertise', 'timeliness']:
        avg = ratings.exclude(**{field: None}).aggregate(Avg(field))[f'{field}__avg']
        if avg:
            category_avgs[field] = round(avg, 2)
    
    # Recent reviews
    recent_reviews = AdvocateRatingListSerializer(
        ratings.filter(review__isnull=False).exclude(review='')[:5],
        many=True
    ).data
    
    return Response({
        'advocate_id': advocate_id,
        'average_rating': round(avg_rating, 2),
        'total_ratings': total,
        'rating_breakdown': breakdown,
        'category_averages': category_avgs,
        'recent_reviews': recent_reviews
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def system_rating_summary(request):
    """Get overall system rating summary (admin only)"""
    
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    ratings = SystemRating.objects.all()
    
    if not ratings.exists():
        return Response({
            'average_rating': 0,
            'total_ratings': 0,
            'rating_breakdown': {},
            'category_averages': {},
            'would_recommend_percentage': 0
        })
    
    avg_rating = ratings.aggregate(Avg('rating'))['rating__avg']
    total = ratings.count()
    
    # Rating breakdown
    breakdown = {}
    for i in range(1, 6):
        count = ratings.filter(rating=i).count()
        breakdown[f'{i}_star'] = {
            'count': count,
            'percentage': round((count / total) * 100, 1) if total > 0 else 0
        }
    
    # Category averages
    category_avgs = {}
    for field in ['ease_of_use', 'features', 'support']:
        avg = ratings.exclude(**{field: None}).aggregate(Avg(field))[f'{field}__avg']
        if avg:
            category_avgs[field] = round(avg, 2)
    
    # Would recommend percentage
    would_recommend_count = ratings.filter(would_recommend=True).count()
    would_recommend_pct = round((would_recommend_count / total) * 100, 1) if total > 0 else 0
    
    return Response({
        'average_rating': round(avg_rating, 2),
        'total_ratings': total,
        'rating_breakdown': breakdown,
        'category_averages': category_avgs,
        'would_recommend_percentage': would_recommend_pct
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def feedback_stats(request):
    """Get feedback statistics for admin dashboard"""
    
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    from django.db.models import Count
    
    # Count by status
    status_counts = Feedback.objects.values('status').annotate(count=Count('id'))
    
    # Count by type
    type_counts = Feedback.objects.values('feedback_type').annotate(count=Count('id'))
    
    # Count by priority
    priority_counts = Feedback.objects.values('priority').annotate(count=Count('id'))
    
    # Recent feedback
    recent = FeedbackListSerializer(
        Feedback.objects.order_by('-created_at')[:5],
        many=True
    ).data
    
    return Response({
        'by_status': {item['status']: item['count'] for item in status_counts},
        'by_type': {item['feedback_type']: item['count'] for item in type_counts},
        'by_priority': {item['priority']: item['count'] for item in priority_counts},
        'total': Feedback.objects.count(),
        'unresolved': Feedback.objects.exclude(status__in=['resolved', 'closed']).count(),
        'recent': recent
    })
