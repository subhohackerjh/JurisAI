from decimal import Decimal
from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    advocate_name = serializers.CharField(source='advocate.name', read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order_id', 'cf_payment_id',
            'customer', 'customer_name',
            'advocate', 'advocate_name',
            'payment_for', 'case', 'description',
            'amount', 'currency', 'status',
            'payment_method', 'cf_order_token',
            'created_at', 'updated_at', 'paid_at',
        ]
        read_only_fields = [
            'id', 'order_id', 'cf_payment_id', 'cf_order_token',
            'status', 'payment_method', 'payment_response',
            'created_at', 'updated_at', 'paid_at',
            'customer_name', 'advocate_name',
        ]


class CreatePaymentSerializer(serializers.Serializer):
    # No advocate is involved in a platform fee payment (e.g. internship_fee)
    advocate_id = serializers.UUIDField(required=False, allow_null=True)
    payment_for = serializers.ChoiceField(choices=[
        'consultation', 'case_filing', 'document_drafting', 'retainer', 'internship_fee'
    ])
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=Decimal('1'))
    case_id = serializers.UUIDField(required=False, allow_null=True)
    description = serializers.CharField(required=False, allow_blank=True, max_length=500)
