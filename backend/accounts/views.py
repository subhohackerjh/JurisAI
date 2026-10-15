from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle, UserRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Q, Case, When, Value, IntegerField


class LoginRateThrottle(AnonRateThrottle):
    rate = '10/hour'
    scope = 'login'


class RegisterRateThrottle(AnonRateThrottle):
    rate = '20/hour'
    scope = 'register'

from .serializers import (
    UserSerializer, UserRegistrationSerializer, UserLoginSerializer,
    CustomTokenObtainPairSerializer, UserProfileUpdateSerializer, PasswordChangeSerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RegisterRateThrottle]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'message': 'User registered successfully',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]


class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserProfileUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        partial = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # Ensure related profile fields are reflected in the response
        if hasattr(user, 'profile'):
            user.profile.refresh_from_db()
        
        return Response({
            'message': 'Profile updated successfully',
            'user': UserSerializer(user).data
        })


class PasswordChangeView(generics.UpdateAPIView):
    serializer_class = PasswordChangeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = self.get_object()
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)


class AdvocateListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(role='advocate', is_active=True, approval_status='approved')

        # Filter by specialization
        specialization = self.request.query_params.get('specialization')
        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)

        # Filter by availability
        availability = self.request.query_params.get('availability')
        if availability:
            queryset = queryset.filter(profile__availability__iexact=availability)

        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(specialization__icontains=search)
            )

        queryset = queryset.select_related('profile')

        # Nearby matching for students: advocates in the same city first, then same
        # state, then everyone else. No geolocation — just text match on profile city/state.
        if self.request.query_params.get('nearby') and self.request.user.role == 'student':
            student_profile = getattr(self.request.user, 'profile', None)
            city = student_profile.city if student_profile else None
            state = student_profile.state if student_profile else None

            annotations = {}
            order_fields = []
            if city:
                annotations['_city_match'] = Case(
                    When(profile__city__iexact=city, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
                order_fields.append('_city_match')
            if state:
                annotations['_state_match'] = Case(
                    When(profile__state__iexact=state, then=Value(0)),
                    default=Value(1),
                    output_field=IntegerField(),
                )
                order_fields.append('_state_match')

            if annotations:
                queryset = queryset.annotate(**annotations).order_by(*order_fields, '-rating')

        return queryset


class AdvocateDetailView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = User.objects.filter(role='advocate', is_active=True).select_related('profile')
    lookup_field = 'pk'


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_stats(request):
    """Get dashboard stats for the current user"""
    user = request.user
    
    stats = {
        'role': user.role,
        'cases_count': 0,
        'pending_cases': 0,
        'completed_cases': 0,
    }
    
    if user.role == 'advocate':
        stats['rating'] = str(user.rating)
        stats['cases_handled'] = user.cases_handled
    
    return Response(stats)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout - blacklists the refresh token"""
    from rest_framework_simplejwt.tokens import RefreshToken
    
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_pending_advocates(request):
    """List all pending advocate registrations (admin only)"""
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    pending_advocates = User.objects.filter(
        role='advocate',
        approval_status='pending'
    ).select_related('profile')
    
    serializer = UserSerializer(pending_advocates, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def approve_advocate(request, user_id):
    """Approve an advocate registration (admin only)"""
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        advocate = User.objects.get(id=user_id, role='advocate')
        if advocate.approval_status != 'pending':
            return Response(
                {'error': 'Advocate is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        advocate.approval_status = 'approved'
        advocate.is_active = True
        advocate.save()
        
        return Response({
            'message': 'Advocate approved successfully',
            'user': UserSerializer(advocate).data
        })
    except User.DoesNotExist:
        return Response({'error': 'Advocate not found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def reject_advocate(request, user_id):
    """Reject an advocate registration (admin only)"""
    if request.user.role != 'admin':
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    rejection_reason = request.data.get('rejection_reason', '')
    
    try:
        advocate = User.objects.get(id=user_id, role='advocate')
        if advocate.approval_status != 'pending':
            return Response(
                {'error': 'Advocate is not in pending status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        advocate.approval_status = 'rejected'
        advocate.is_active = False
        advocate.rejection_reason = rejection_reason
        advocate.save()
        
        return Response({
            'message': 'Advocate rejected successfully',
            'user': UserSerializer(advocate).data
        })
    except User.DoesNotExist:
        return Response({'error': 'Advocate not found'}, status=status.HTTP_404_NOT_FOUND)
