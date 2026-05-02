from rest_framework import generics, status, permissions, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Case, CaseDocument, Hearing, CaseUpdate, DraftRequest
from .serializers import (
    CaseListSerializer, CaseDetailSerializer, CaseCreateSerializer,
    CaseStatusUpdateSerializer, CaseDocumentSerializer, HearingSerializer,
    CaseUpdateSerializer, DraftRequestListSerializer, DraftRequestDetailSerializer,
    DraftRequestCreateSerializer, DraftRequestUpdateSerializer
)


class CaseListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'cnr_number', 'court_name', 'description']
    ordering_fields = ['created_at', 'updated_at', 'next_hearing_date', 'status']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CaseCreateSerializer
        return CaseListSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Filter based on user role
        if user.role == 'customer':
            queryset = Case.objects.filter(customer=user)
        elif user.role == 'advocate':
            queryset = Case.objects.filter(advocate=user)
        elif user.role in ['admin', 'police']:
            queryset = Case.objects.all()
        else:
            queryset = Case.objects.none()
        
        # Additional filters
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        
        case_type = self.request.query_params.get('case_type')
        if case_type:
            queryset = queryset.filter(case_type=case_type)
        
        return queryset.select_related('customer', 'advocate').prefetch_related('documents', 'hearings')


class CaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaseDetailSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return Case.objects.filter(customer=user)
        elif user.role == 'advocate':
            return Case.objects.filter(advocate=user)
        elif user.role in ['admin', 'police']:
            return Case.objects.all()
        return Case.objects.none()


class CaseStatusUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaseStatusUpdateSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'advocate':
            return Case.objects.filter(advocate=user)
        elif user.role == 'admin':
            return Case.objects.all()
        return Case.objects.none()


class CaseDocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaseDocumentSerializer
    
    def get_queryset(self):
        case_id = self.kwargs.get('case_pk')
        return CaseDocument.objects.filter(case_id=case_id)
    
    def perform_create(self, serializer):
        case_id = self.kwargs.get('case_pk')
        case = get_object_or_404(Case, pk=case_id)
        
        # Check permissions
        user = self.request.user
        if user.role == 'customer' and case.customer != user:
            raise permissions.PermissionDenied("You can only add documents to your own cases")
        if user.role == 'advocate' and case.advocate != user:
            raise permissions.PermissionDenied("You can only add documents to your assigned cases")
        
        serializer.save(case=case, uploaded_by=user)
        
        # Create case update
        CaseUpdate.objects.create(
            case=case,
            update_type='document_added',
            title=f'Document added: {serializer.validated_data.get("title")}',
            description=f'A new {serializer.validated_data.get("document_type")} document was added',
            created_by=user,
            is_customer_visible=True
        )


class CaseDocumentDetailView(generics.RetrieveDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaseDocumentSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        return CaseDocument.objects.all()


class HearingListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HearingSerializer
    
    def get_queryset(self):
        case_id = self.kwargs.get('case_pk')
        return Hearing.objects.filter(case_id=case_id)
    
    def perform_create(self, serializer):
        case_id = self.kwargs.get('case_pk')
        case = get_object_or_404(Case, pk=case_id)
        
        # Only advocates and admins can schedule hearings
        user = self.request.user
        if user.role not in ['advocate', 'admin']:
            raise permissions.PermissionDenied("Only advocates can schedule hearings")
        
        hearing = serializer.save(case=case)
        
        # Update case next hearing date
        case.next_hearing_date = hearing.hearing_date
        case.save()
        
        # Create case update
        CaseUpdate.objects.create(
            case=case,
            update_type='hearing_scheduled',
            title=f'Hearing scheduled for {hearing.hearing_date.strftime("%d %b %Y")}',
            description=hearing.purpose,
            created_by=user,
            is_customer_visible=True
        )


class HearingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = HearingSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        return Hearing.objects.all()
    
    def perform_update(self, serializer):
        instance = self.get_object()
        old_completed = instance.is_completed
        hearing = serializer.save()
        
        # If hearing was marked as completed, create an update
        if not old_completed and hearing.is_completed:
            CaseUpdate.objects.create(
                case=hearing.case,
                update_type='hearing_completed',
                title=f'Hearing completed on {hearing.hearing_date.strftime("%d %b %Y")}',
                description=hearing.outcome or 'Hearing was completed',
                created_by=self.request.user,
                is_customer_visible=True
            )


class CaseUpdateListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CaseUpdateSerializer
    
    def get_queryset(self):
        case_id = self.kwargs.get('case_pk')
        user = self.request.user
        
        queryset = CaseUpdate.objects.filter(case_id=case_id)
        
        # Customers only see visible updates
        if user.role == 'customer':
            queryset = queryset.filter(is_customer_visible=True)
        
        return queryset
    
    def perform_create(self, serializer):
        case_id = self.kwargs.get('case_pk')
        case = get_object_or_404(Case, pk=case_id)
        serializer.save(case=case, created_by=self.request.user)


class DashboardStatsView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        stats = {
            'total_cases': 0,
            'pending_cases': 0,
            'active_cases': 0,
            'completed_cases': 0,
            'recent_cases': [],
        }
        
        if user.role == 'customer':
            cases = Case.objects.filter(customer=user)
        elif user.role == 'advocate':
            cases = Case.objects.filter(advocate=user)
            stats['rating'] = str(user.rating)
            stats['cases_handled'] = user.cases_handled
        elif user.role in ['admin', 'police']:
            cases = Case.objects.all()
        else:
            cases = Case.objects.none()
        
        stats['total_cases'] = cases.count()
        stats['pending_cases'] = cases.filter(status='pending').count()
        stats['active_cases'] = cases.filter(status__in=['hearing', 'evidence', 'arguments']).count()
        stats['completed_cases'] = cases.filter(status__in=['closed', 'dismissed']).count()
        stats['recent_cases'] = CaseListSerializer(
            cases.order_by('-updated_at')[:5], 
            many=True,
            context={'request': request}
        ).data
        
        return Response(stats)


# Draft Request Views
class DraftRequestListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DraftRequestCreateSerializer
        return DraftRequestListSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return DraftRequest.objects.filter(customer=user)
        elif user.role == 'advocate':
            return DraftRequest.objects.filter(advocate=user)
        elif user.role == 'admin':
            return DraftRequest.objects.all()
        return DraftRequest.objects.none()


class DraftRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DraftRequestDetailSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'customer':
            return DraftRequest.objects.filter(customer=user)
        elif user.role == 'advocate':
            return DraftRequest.objects.filter(advocate=user)
        elif user.role == 'admin':
            return DraftRequest.objects.all()
        return DraftRequest.objects.none()


class DraftRequestUpdateStatusView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = DraftRequestUpdateSerializer
    lookup_field = 'pk'
    
    def get_queryset(self):
        user = self.request.user
        
        # Only advocates can update draft status
        if user.role == 'advocate':
            return DraftRequest.objects.filter(advocate=user)
        elif user.role == 'admin':
            return DraftRequest.objects.all()
        return DraftRequest.objects.none()


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def case_search(request):
    """Search cases by CNR number, title, or parties"""
    query = request.query_params.get('q', '')
    
    if not query:
        return Response({'error': 'Query parameter "q" is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = request.user
    
    # Build base queryset based on user role
    if user.role == 'customer':
        queryset = Case.objects.filter(customer=user)
    elif user.role == 'advocate':
        queryset = Case.objects.filter(advocate=user)
    elif user.role in ['admin', 'police']:
        queryset = Case.objects.all()
    else:
        queryset = Case.objects.none()
    
    # Apply search filter
    queryset = queryset.filter(
        Q(cnr_number__icontains=query) |
        Q(title__icontains=query) |
        Q(customer__name__icontains=query) |
        Q(advocate__name__icontains=query) |
        Q(court_name__icontains=query)
    )
    
    serializer = CaseListSerializer(queryset[:20], many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def upcoming_hearings(request):
    """Get upcoming hearings for the user"""
    user = request.user
    
    if user.role == 'customer':
        cases = Case.objects.filter(customer=user)
    elif user.role == 'advocate':
        cases = Case.objects.filter(advocate=user)
    elif user.role in ['admin', 'police']:
        cases = Case.objects.all()
    else:
        cases = Case.objects.none()
    
    hearings = Hearing.objects.filter(
        case__in=cases,
        hearing_date__gte=timezone.now(),
        is_completed=False
    ).order_by('hearing_date')[:10]
    
    serializer = HearingSerializer(hearings, many=True)
    return Response(serializer.data)
