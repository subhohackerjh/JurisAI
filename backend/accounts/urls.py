from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView, LoginView, UserProfileView, UserProfileUpdateView,
    PasswordChangeView, AdvocateListView, AdvocateDetailView,
    get_user_stats, logout_view, list_pending_advocates,
    approve_advocate, reject_advocate
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', UserProfileUpdateView.as_view(), name='profile_update'),
    path('password/change/', PasswordChangeView.as_view(), name='password_change'),
    
    # User Stats
    path('stats/', get_user_stats, name='user_stats'),
    
    # Advocates
    path('advocates/', AdvocateListView.as_view(), name='advocate_list'),
    path('advocates/<int:pk>/', AdvocateDetailView.as_view(), name='advocate_detail'),
    
    # Advocate Approval (Admin)
    path('advocates/pending/', list_pending_advocates, name='pending_advocates'),
    path('advocates/<int:user_id>/approve/', approve_advocate, name='approve_advocate'),
    path('advocates/<int:user_id>/reject/', reject_advocate, name='reject_advocate'),
]
