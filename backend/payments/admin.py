from django.contrib import admin
from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ['order_id', 'customer', 'advocate', 'amount', 'status', 'payment_for', 'created_at']
    list_filter = ['status', 'payment_for', 'currency']
    search_fields = ['order_id', 'cf_payment_id', 'customer__email', 'advocate__email']
    readonly_fields = ['id', 'order_id', 'cf_payment_id', 'cf_order_token', 'payment_response', 'created_at', 'updated_at', 'paid_at']
