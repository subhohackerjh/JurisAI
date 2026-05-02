from django.urls import path
from .views import (
    FeedbackListCreateView, FeedbackDetailView, FeedbackResponseListCreateView,
    AdvocateRatingListCreateView, AdvocateRatingDetailView,
    SystemRatingListCreateView, SystemRatingDetailView,
    advocate_rating_summary, system_rating_summary, feedback_stats
)

urlpatterns = [
    # Feedback
    path('', FeedbackListCreateView.as_view(), name='feedback-list'),
    path('<uuid:pk>/', FeedbackDetailView.as_view(), name='feedback-detail'),
    path('<uuid:feedback_pk>/responses/', FeedbackResponseListCreateView.as_view(), name='feedback-responses'),
    
    # Advocate Ratings
    path('ratings/advocate/', AdvocateRatingListCreateView.as_view(), name='advocate-rating-list'),
    path('ratings/advocate/<uuid:pk>/', AdvocateRatingDetailView.as_view(), name='advocate-rating-detail'),
    path('ratings/advocate/<int:advocate_id>/summary/', advocate_rating_summary, name='advocate-rating-summary'),
    
    # System Ratings
    path('ratings/system/', SystemRatingListCreateView.as_view(), name='system-rating-list'),
    path('ratings/system/<uuid:pk>/', SystemRatingDetailView.as_view(), name='system-rating-detail'),
    path('ratings/system/summary/', system_rating_summary, name='system-rating-summary'),
    
    # Stats
    path('stats/', feedback_stats, name='feedback-stats'),
]
