from django.urls import path
from . import views

urlpatterns = [
    path('', views.list_payments, name='list_payments'),
    path('create/', views.create_payment, name='create_payment'),
    path('verify/<str:order_id>/', views.verify_payment, name='verify_payment'),
    path('webhook/', views.cashfree_webhook, name='cashfree_webhook'),
    path('stats/', views.payment_stats, name='payment_stats'),
]
