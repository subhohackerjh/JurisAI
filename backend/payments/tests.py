from unittest.mock import patch, MagicMock
from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APIClient, APITestCase
from rest_framework import status

from .models import Payment

User = get_user_model()


def fake_cashfree_response(session_id='session_abc123'):
    resp = MagicMock()
    resp.data.payment_session_id = session_id
    return resp


class PaymentsAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.student = User.objects.create_user(
            email='student@test.com', name='Student One', password='testpass123',
            role='student', law_college='NLSIU', is_active=True,
        )
        self.customer = User.objects.create_user(
            email='customer@test.com', name='Customer One', password='testpass123',
            role='customer', is_active=True,
        )
        self.advocate = User.objects.create_user(
            email='advocate@test.com', name='Advocate One', password='testpass123',
            role='advocate', specialization='Criminal Law', bar_council='Bar Council of Delhi',
            approval_status='approved', is_active=True,
        )

    @patch('payments.views.Cashfree')
    def test_internship_fee_amount_forced_server_side(self, mock_cashfree_cls):
        mock_cashfree_cls.return_value.PGCreateOrder.return_value = fake_cashfree_response()
        self.client.force_authenticate(user=self.student)

        # Client tries to pay ₹1 instead of ₹399 — must be ignored
        response = self.client.post('/api/payments/create/', {
            'payment_for': 'internship_fee',
            'amount': '1.00',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        payment = Payment.objects.get(order_id=response.data['order_id'])
        self.assertEqual(payment.amount, Decimal('399.00'))
        self.assertIsNone(payment.advocate)

    @patch('payments.views.Cashfree')
    def test_internship_fee_blocked_for_non_student(self, mock_cashfree_cls):
        mock_cashfree_cls.return_value.PGCreateOrder.return_value = fake_cashfree_response()
        self.client.force_authenticate(user=self.customer)

        response = self.client.post('/api/payments/create/', {
            'payment_for': 'internship_fee',
            'amount': '399.00',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch('payments.views.Cashfree')
    def test_internship_fee_idempotent(self, mock_cashfree_cls):
        mock_cashfree_cls.return_value.PGCreateOrder.return_value = fake_cashfree_response()
        Payment.objects.create(
            order_id='L24_EXISTING', customer=self.student, advocate=None,
            payment_for='internship_fee', amount='399.00', status='paid',
        )
        self.client.force_authenticate(user=self.student)

        response = self.client.post('/api/payments/create/', {
            'payment_for': 'internship_fee',
            'amount': '399.00',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_consultation_requires_advocate_id(self):
        self.client.force_authenticate(user=self.customer)
        response = self.client.post('/api/payments/create/', {
            'payment_for': 'consultation',
            'amount': '500.00',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
