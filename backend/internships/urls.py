from django.urls import path

from .views import (
    InternshipListCreateView, InternshipDetailView, internship_apply,
    MyApplicationsView, update_application_status, upload_offer_letter,
)

urlpatterns = [
    path('', InternshipListCreateView.as_view(), name='internship-list'),
    path('<uuid:pk>/', InternshipDetailView.as_view(), name='internship-detail'),
    path('<uuid:pk>/apply/', internship_apply, name='internship-apply'),
    path('applications/', MyApplicationsView.as_view(), name='internship-applications'),
    path('applications/<uuid:pk>/status/', update_application_status, name='internship-application-status'),
    path('applications/<uuid:pk>/offer-letter/', upload_offer_letter, name='internship-offer-letter'),
]
