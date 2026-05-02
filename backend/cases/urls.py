from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CaseListCreateView, CaseDetailView, CaseStatusUpdateView,
    CaseDocumentListCreateView, CaseDocumentDetailView,
    HearingListCreateView, HearingDetailView,
    CaseUpdateListCreateView, DashboardStatsView,
    DraftRequestListCreateView, DraftRequestDetailView,
    DraftRequestUpdateStatusView, case_search, upcoming_hearings
)

urlpatterns = [
    # Case URLs
    path('', CaseListCreateView.as_view(), name='case-list'),
    path('<uuid:pk>/', CaseDetailView.as_view(), name='case-detail'),
    path('<uuid:pk>/status/', CaseStatusUpdateView.as_view(), name='case-status-update'),
    
    # Case Documents
    path('<uuid:case_pk>/documents/', CaseDocumentListCreateView.as_view(), name='case-document-list'),
    path('<uuid:case_pk>/documents/<uuid:pk>/', CaseDocumentDetailView.as_view(), name='case-document-detail'),
    
    # Case Hearings
    path('<uuid:case_pk>/hearings/', HearingListCreateView.as_view(), name='case-hearing-list'),
    path('<uuid:case_pk>/hearings/<uuid:pk>/', HearingDetailView.as_view(), name='case-hearing-detail'),
    
    # Case Updates
    path('<uuid:case_pk>/updates/', CaseUpdateListCreateView.as_view(), name='case-update-list'),
    
    # Dashboard
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Search
    path('search/', case_search, name='case-search'),
    
    # Upcoming Hearings
    path('upcoming-hearings/', upcoming_hearings, name='upcoming-hearings'),
    
    # Draft Requests
    path('drafts/', DraftRequestListCreateView.as_view(), name='draft-list'),
    path('drafts/<uuid:pk>/', DraftRequestDetailView.as_view(), name='draft-detail'),
    path('drafts/<uuid:pk>/status/', DraftRequestUpdateStatusView.as_view(), name='draft-status-update'),
]
