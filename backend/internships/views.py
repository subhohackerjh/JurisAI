from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import Internship, InternshipApplication
from .serializers import (
    InternshipSerializer, InternshipApplicationSerializer,
    InternshipApplicationStatusSerializer, OfferLetterUploadSerializer,
)
from payments.models import Payment
from messaging.models import Conversation


class InternshipListCreateView(generics.ListCreateAPIView):
    serializer_class = InternshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Internship.objects.filter(status='open').select_related('advocate')

        practice_area = self.request.query_params.get('practice_area')
        if practice_area:
            queryset = queryset.filter(practice_area__icontains=practice_area)

        # Advocates can also see their own closed postings via ?mine=1
        if self.request.query_params.get('mine') and self.request.user.role == 'advocate':
            queryset = Internship.objects.filter(advocate=self.request.user).select_related('advocate')

        return queryset

    def perform_create(self, serializer):
        if self.request.user.role != 'advocate':
            raise permissions.PermissionDenied('Only advocates can post internships.')
        serializer.save(advocate=self.request.user)


class InternshipDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = InternshipSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    queryset = Internship.objects.select_related('advocate')

    def perform_update(self, serializer):
        if serializer.instance.advocate != self.request.user:
            raise permissions.PermissionDenied('You can only edit your own internship postings.')
        serializer.save()

    def perform_destroy(self, instance):
        if instance.advocate != self.request.user:
            raise permissions.PermissionDenied('You can only delete your own internship postings.')
        instance.delete()


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def internship_apply(request, pk):
    """Student applies to an internship with a CV. Gated on the one-time platform fee."""
    if request.user.role != 'student':
        return Response({'error': 'Only students can apply to internships.'}, status=status.HTTP_403_FORBIDDEN)

    internship = get_object_or_404(Internship, pk=pk)
    if internship.status != 'open':
        return Response({'error': 'This internship is no longer accepting applications.'}, status=status.HTTP_400_BAD_REQUEST)

    has_paid = Payment.objects.filter(
        customer=request.user, payment_for='internship_fee', status='paid'
    ).exists()
    if not has_paid:
        return Response(
            {'error': 'Pay the one-time internship platform fee before applying.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    if InternshipApplication.objects.filter(internship=internship, student=request.user).exists():
        return Response({'error': 'You have already applied to this internship.'}, status=status.HTTP_409_CONFLICT)

    serializer = InternshipApplicationSerializer(data=request.data, context={'request': request})
    serializer.is_valid(raise_exception=True)
    serializer.save(internship=internship, student=request.user)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyApplicationsView(generics.ListAPIView):
    serializer_class = InternshipApplicationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        base = InternshipApplication.objects.select_related('internship', 'internship__advocate', 'student', 'student__profile')
        if user.role == 'student':
            return base.filter(student=user)
        elif user.role == 'advocate':
            return base.filter(internship__advocate=user)
        return InternshipApplication.objects.none()


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_application_status(request, pk):
    """Advocate shortlists/selects/rejects an applicant."""
    application = get_object_or_404(InternshipApplication, pk=pk)
    if request.user.role != 'advocate' or application.internship.advocate != request.user:
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = InternshipApplicationStatusSerializer(application, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    application = serializer.save()

    # Selecting an applicant unlocks chat between the student and advocate — create the
    # conversation now so it's ready as soon as either side looks for it.
    if application.status == 'selected':
        Conversation.objects.get_or_create(customer=application.student, advocate=request.user)

    return Response(InternshipApplicationSerializer(application, context={'request': request}).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_offer_letter(request, pk):
    """Advocate uploads an offer letter for a selected applicant."""
    application = get_object_or_404(InternshipApplication, pk=pk)
    if request.user.role != 'advocate' or application.internship.advocate != request.user:
        return Response({'error': 'Access denied.'}, status=status.HTTP_403_FORBIDDEN)

    if application.status != 'selected':
        return Response({'error': 'You can only send an offer letter to a selected applicant.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = OfferLetterUploadSerializer(application, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    application = serializer.save()

    application.offer_sent_at = timezone.now()
    application.save(update_fields=['offer_sent_at'])

    return Response(InternshipApplicationSerializer(application, context={'request': request}).data)
