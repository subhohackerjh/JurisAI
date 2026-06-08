"""
Cashfree payment views.
Flow:
  1. POST /api/payments/create/  → creates Cashfree order, returns payment_session_id
  2. Frontend uses Cashfree JS SDK to open checkout
  3. Cashfree POSTs webhook to /api/payments/webhook/
  4. GET /api/payments/verify/<order_id>/ → client-side status check
  5. GET /api/payments/ → list user's payments
"""
import uuid
import json
import hashlib
import hmac
import logging
from datetime import datetime

from django.conf import settings
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from cashfree_pg.models.create_order_request import CreateOrderRequest
from cashfree_pg.models.customer_details import CustomerDetails
from cashfree_pg.models.order_meta import OrderMeta
from cashfree_pg.api_client import Cashfree

from accounts.models import User
from .models import Payment
from .serializers import PaymentSerializer, CreatePaymentSerializer

logger = logging.getLogger(__name__)

# ── Configure Cashfree SDK ────────────────────────────────────────────────────
Cashfree.XClientId = settings.CASHFREE_APP_ID
Cashfree.XClientSecret = settings.CASHFREE_SECRET_KEY
Cashfree.XEnvironment = (
    Cashfree.PRODUCTION if settings.CASHFREE_ENV == 'production' else Cashfree.SANDBOX
)
_CF_VERSION = '2023-08-01'


def _make_order_id():
    return f'L24_{uuid.uuid4().hex[:16].upper()}'


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment(request):
    """Create a Cashfree order and return the payment_session_id to the frontend."""
    if request.user.role != 'customer':
        return Response({'error': 'Only customers can initiate payments'}, status=status.HTTP_403_FORBIDDEN)

    ser = CreatePaymentSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    data = ser.validated_data

    try:
        advocate = User.objects.get(id=data['advocate_id'], role='advocate', approval_status='approved')
    except User.DoesNotExist:
        return Response({'error': 'Advocate not found'}, status=status.HTTP_404_NOT_FOUND)

    order_id = _make_order_id()
    amount = float(data['amount'])

    # Build Cashfree order
    customer_details = CustomerDetails(
        customer_id=str(request.user.id),
        customer_phone=request.user.phone or '9999999999',
        customer_email=request.user.email,
        customer_name=request.user.name,
    )

    return_url = f"{settings.FRONTEND_URL if hasattr(settings, 'FRONTEND_URL') else 'http://localhost:3000'}/dashboard/payments/status?order_id={order_id}"

    order_meta = OrderMeta(return_url=return_url)

    cf_request = CreateOrderRequest(
        order_id=order_id,
        order_amount=amount,
        order_currency='INR',
        customer_details=customer_details,
        order_meta=order_meta,
        order_note=f"{data['payment_for']} - {data.get('description', '')}",
    )

    try:
        cf_response = Cashfree().PGCreateOrder(_CF_VERSION, cf_request)
        cf_data = cf_response.data
    except Exception as e:
        logger.error('Cashfree create order error: %s', e)
        return Response({'error': 'Payment gateway error. Please try again.'}, status=status.HTTP_502_BAD_GATEWAY)

    # Save to DB
    payment = Payment.objects.create(
        order_id=order_id,
        customer=request.user,
        advocate=advocate,
        payment_for=data['payment_for'],
        case_id=data.get('case_id'),
        description=data.get('description', ''),
        amount=data['amount'],
        status='created',
        cf_order_token=cf_data.payment_session_id or '',
    )

    return Response({
        'order_id': order_id,
        'payment_session_id': cf_data.payment_session_id,
        'amount': amount,
        'currency': 'INR',
        'payment_id': str(payment.id),
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def verify_payment(request, order_id):
    """Poll payment status — called by frontend after Cashfree redirect."""
    try:
        payment = Payment.objects.get(order_id=order_id)
    except Payment.DoesNotExist:
        return Response({'error': 'Payment not found'}, status=status.HTTP_404_NOT_FOUND)

    # Only the customer or admin can verify
    if request.user.role == 'customer' and payment.customer != request.user:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    # Fetch live status from Cashfree
    try:
        cf_resp = Cashfree().PGFetchOrder(_CF_VERSION, order_id)
        cf_status = cf_resp.data.order_status  # ACTIVE / PAID / EXPIRED
    except Exception as e:
        logger.error('Cashfree fetch order error: %s', e)
        cf_status = None

    if cf_status == 'PAID' and payment.status != 'paid':
        payment.status = 'paid'
        payment.paid_at = timezone.now()
        payment.save(update_fields=['status', 'paid_at'])

    serializer = PaymentSerializer(payment)
    return Response({'payment': serializer.data, 'cf_status': cf_status})


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def cashfree_webhook(request):
    """Cashfree webhook — updates payment status in DB."""
    # Verify webhook signature
    received_signature = request.headers.get('x-webhook-signature', '')
    timestamp = request.headers.get('x-webhook-timestamp', '')
    raw_body = request.body.decode('utf-8')

    secret = settings.CASHFREE_SECRET_KEY
    message = f"{timestamp}{raw_body}"
    # Use hmac.new (correct Python stdlib call)
    expected = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()

    # SECURITY: reject if signature is missing OR mismatched — never skip verification
    if not received_signature or not hmac.compare_digest(received_signature, expected):
        logger.warning('Cashfree webhook: invalid or missing signature')
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)

    event_type = payload.get('type', '')
    data = payload.get('data', {})
    order_data = data.get('order', {})
    payment_data = data.get('payment', {})

    order_id = order_data.get('order_id', '')
    if not order_id:
        return Response({'ok': True})

    try:
        payment = Payment.objects.get(order_id=order_id)
    except Payment.DoesNotExist:
        return Response({'ok': True})

    # Map Cashfree event to our status
    cf_payment_status = payment_data.get('payment_status', '').upper()
    if event_type == 'PAYMENT_SUCCESS_WEBHOOK' or cf_payment_status == 'SUCCESS':
        payment.status = 'paid'
        payment.paid_at = timezone.now()
        payment.cf_payment_id = payment_data.get('cf_payment_id', '')
        payment.payment_method = payment_data.get('payment_group', '')
    elif event_type == 'PAYMENT_FAILED_WEBHOOK' or cf_payment_status == 'FAILED':
        payment.status = 'failed'
    elif cf_payment_status == 'USER_DROPPED':
        payment.status = 'cancelled'

    payment.payment_response = payload
    payment.save()

    return Response({'ok': True})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_payments(request):
    """List payments for the current user."""
    user = request.user
    if user.role == 'customer':
        payments = Payment.objects.filter(customer=user)
    elif user.role == 'advocate':
        payments = Payment.objects.filter(advocate=user)
    elif user.role == 'admin':
        payments = Payment.objects.all()
    else:
        return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)

    payments = payments.select_related('customer', 'advocate', 'case')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def payment_stats(request):
    """Admin-only payment statistics."""
    if request.user.role != 'admin':
        return Response({'error': 'Admin only'}, status=status.HTTP_403_FORBIDDEN)

    from django.db.models import Sum, Count, Q
    stats = Payment.objects.aggregate(
        total_transactions=Count('id'),
        total_revenue=Sum('amount', filter=Q(status='paid')),
        pending_amount=Sum('amount', filter=Q(status__in=['created', 'pending'])),
    )
    stats['total_revenue'] = float(stats['total_revenue'] or 0)
    stats['pending_amount'] = float(stats['pending_amount'] or 0)

    by_status = list(
        Payment.objects.values('status')
        .annotate(count=Count('id'), total=Sum('amount'))
        .order_by('status')
    )

    return Response({'overview': stats, 'by_status': by_status})
