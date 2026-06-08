"""
Admin analytics endpoint — returns all platform stats in a single request
to power the admin dashboard charts.
"""
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Sum, Avg, Q
from django.db.models.functions import TruncDay, TruncMonth
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def admin_analytics(request):
    if request.user.role != 'admin':
        from rest_framework import status
        return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)

    from accounts.models import User
    from cases.models import Case
    from feedback.models import Feedback
    from messaging.models import Conversation, Message

    now = timezone.now()
    today = now.date()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)
    year_ago = now - timedelta(days=365)

    # ── User stats ────────────────────────────────────────────────────────────
    total_users = User.objects.count()
    new_users_week = User.objects.filter(date_joined__gte=week_ago).count()
    new_users_month = User.objects.filter(date_joined__gte=month_ago).count()

    users_by_role = list(
        User.objects.values('role').annotate(count=Count('id')).order_by('role')
    )
    advocates_pending = User.objects.filter(role='advocate', approval_status='pending').count()
    advocates_approved = User.objects.filter(role='advocate', approval_status='approved').count()

    # Daily registrations (last 30 days)
    daily_registrations = list(
        User.objects.filter(date_joined__gte=month_ago)
        .annotate(day=TruncDay('date_joined'))
        .values('day')
        .annotate(count=Count('id'))
        .order_by('day')
    )
    for r in daily_registrations:
        r['day'] = r['day'].strftime('%Y-%m-%d')

    # ── Case stats ────────────────────────────────────────────────────────────
    total_cases = Case.objects.count()
    new_cases_week = Case.objects.filter(created_at__gte=week_ago).count()
    new_cases_month = Case.objects.filter(created_at__gte=month_ago).count()

    cases_by_status = list(
        Case.objects.values('status').annotate(count=Count('id')).order_by('status')
    )
    cases_by_type = list(
        Case.objects.values('case_type').annotate(count=Count('id')).order_by('-count')
    )

    # Monthly case filings (last 12 months)
    monthly_cases = list(
        Case.objects.filter(created_at__gte=year_ago)
        .annotate(month=TruncMonth('created_at'))
        .values('month')
        .annotate(count=Count('id'))
        .order_by('month')
    )
    for m in monthly_cases:
        m['month'] = m['month'].strftime('%Y-%m')

    # ── Feedback stats ────────────────────────────────────────────────────────
    total_feedback = Feedback.objects.count()
    open_feedback = Feedback.objects.filter(status__in=['new', 'under_review', 'in_progress']).count()
    resolved_feedback = Feedback.objects.filter(status='resolved').count()

    feedback_by_type = list(
        Feedback.objects.values('feedback_type').annotate(count=Count('id')).order_by('-count')
    )
    feedback_by_priority = list(
        Feedback.objects.values('priority').annotate(count=Count('id')).order_by('priority')
    )

    # ── Messaging stats ───────────────────────────────────────────────────────
    total_conversations = Conversation.objects.count()
    active_conversations = Conversation.objects.filter(is_active=True).count()
    total_messages = Message.objects.count()
    messages_week = Message.objects.filter(timestamp__gte=week_ago).count()

    # ── Payment stats (if payments app exists) ────────────────────────────────
    payment_overview = {}
    revenue_by_month = []
    try:
        from payments.models import Payment
        from django.db.models import DecimalField
        payment_overview = Payment.objects.aggregate(
            total=Count('id'),
            paid=Count('id', filter=Q(status='paid')),
            total_revenue=Sum('amount', filter=Q(status='paid')),
            pending=Count('id', filter=Q(status__in=['created', 'pending'])),
        )
        payment_overview['total_revenue'] = float(payment_overview.get('total_revenue') or 0)

        revenue_by_month = list(
            Payment.objects.filter(status='paid', paid_at__gte=year_ago)
            .annotate(month=TruncMonth('paid_at'))
            .values('month')
            .annotate(revenue=Sum('amount'), count=Count('id'))
            .order_by('month')
        )
        for r in revenue_by_month:
            r['month'] = r['month'].strftime('%Y-%m')
            r['revenue'] = float(r['revenue'])
    except Exception:
        pass

    # ── Advocate performance (single efficient query, no N+1) ─────────────────
    top_advocates = list(
        User.objects.filter(role='advocate', approval_status='approved')
        .annotate(case_count=Count('advocate_cases', distinct=True))
        .values('id', 'name', 'specialization', 'rating', 'cases_handled', 'case_count')
        .order_by('-cases_handled')[:10]
    )
    for a in top_advocates:
        a['id'] = str(a['id'])
        a['rating'] = str(a['rating'] or '0.0')

    return Response({
        'generated_at': now.isoformat(),
        'users': {
            'total': total_users,
            'new_this_week': new_users_week,
            'new_this_month': new_users_month,
            'by_role': users_by_role,
            'advocates_pending': advocates_pending,
            'advocates_approved': advocates_approved,
            'daily_registrations': daily_registrations,
        },
        'cases': {
            'total': total_cases,
            'new_this_week': new_cases_week,
            'new_this_month': new_cases_month,
            'by_status': cases_by_status,
            'by_type': cases_by_type,
            'monthly_filings': monthly_cases,
        },
        'feedback': {
            'total': total_feedback,
            'open': open_feedback,
            'resolved': resolved_feedback,
            'resolution_rate': round(resolved_feedback / total_feedback * 100, 1) if total_feedback else 0,
            'by_type': feedback_by_type,
            'by_priority': feedback_by_priority,
        },
        'messaging': {
            'total_conversations': total_conversations,
            'active_conversations': active_conversations,
            'total_messages': total_messages,
            'messages_this_week': messages_week,
        },
        'payments': {
            'overview': payment_overview,
            'revenue_by_month': revenue_by_month,
        },
        'top_advocates': top_advocates,
    })
