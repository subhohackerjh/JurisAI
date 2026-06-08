import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Payment(models.Model):
    """Tracks all payment transactions via Cashfree."""

    STATUS_CHOICES = [
        ('created', 'Created'),
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('refunded', 'Refunded'),
    ]

    PAYMENT_FOR_CHOICES = [
        ('consultation', 'Consultation Fee'),
        ('case_filing', 'Case Filing Fee'),
        ('document_drafting', 'Document Drafting'),
        ('retainer', 'Retainer Fee'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_id = models.CharField(max_length=100, unique=True, help_text='Cashfree order ID')
    cf_payment_id = models.CharField(max_length=100, blank=True, help_text='Cashfree payment ID after success')

    # Who paid & to whom
    customer = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='payments_made')
    advocate = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='payments_received')

    # What for
    payment_for = models.CharField(max_length=30, choices=PAYMENT_FOR_CHOICES, default='consultation')
    case = models.ForeignKey('cases.Case', on_delete=models.SET_NULL, null=True, blank=True, related_name='payments')
    description = models.TextField(blank=True)

    # Amounts (INR paise → store as Decimal rupees)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='INR')

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='created')
    payment_method = models.CharField(max_length=50, blank=True)

    # Cashfree response data
    cf_order_token = models.TextField(blank=True, help_text='Cashfree payment session id')
    payment_response = models.JSONField(null=True, blank=True, help_text='Full Cashfree webhook payload')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer']),
            models.Index(fields=['advocate']),
            models.Index(fields=['status']),
            models.Index(fields=['order_id']),
        ]

    def __str__(self):
        return f'Payment {self.order_id} — ₹{self.amount} ({self.status})'
