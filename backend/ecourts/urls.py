from django.urls import path
from .views import (
    get_case_by_cnr, import_case_from_ecourts,
    search_ecourts_cases, get_cause_list, get_ecourts_status
)

urlpatterns = [
    path('status/', get_ecourts_status, name='ecourts-status'),
    path('case/', get_case_by_cnr, name='ecourts-case-detail'),
    path('import/', import_case_from_ecourts, name='ecourts-import'),
    path('search/', search_ecourts_cases, name='ecourts-search'),
    path('causelist/', get_cause_list, name='ecourts-causelist'),
]
