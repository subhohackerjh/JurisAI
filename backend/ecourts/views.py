"""
API Views for eCourts Integration
"""
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.core.cache import cache

from .services import ecourts_service
from cases.models import Case
from cases.serializers import CaseCreateSerializer


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_case_by_cnr(request):
    """
    GET /api/ecourts/case/?cnr=KAMS011234567890
    
    Fetch case details from eCourts by CNR number
    """
    cnr_number = request.query_params.get('cnr')
    
    if not cnr_number:
        return Response(
            {'error': 'CNR number is required. Use ?cnr=KAMS011234567890'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check cache first
    cache_key = f'ecourts_case_{cnr_number.upper().replace("-", "")}'
    cached_data = cache.get(cache_key)
    
    if cached_data:
        return Response({
            'source': 'cache',
            'data': cached_data
        })
    
    # Fetch from eCourts API
    result = ecourts_service.get_case_by_cnr(cnr_number)
    
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    # Cache successful response for 1 hour
    cache.set(cache_key, result, 3600)
    
    return Response({
        'source': 'ecourts_api',
        'data': result
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def import_case_from_ecourts(request):
    """
    POST /api/ecourts/import/
    
    Import a case from eCourts into local database
    {
        "cnr": "KAMS011234567890",
        "advocate_id": "uuid" (optional)
    }
    """
    cnr_number = request.data.get('cnr')
    advocate_id = request.data.get('advocate_id')
    
    if not cnr_number:
        return Response(
            {'error': 'CNR number is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if case already exists
    existing_case = Case.objects.filter(cnr_number=cnr_number.upper().replace('-', '')).first()
    if existing_case:
        return Response({
            'message': 'Case already exists in system',
            'case_id': str(existing_case.id),
            'cnr': existing_case.cnr_number
        }, status=status.HTTP_200_OK)
    
    # Fetch from eCourts
    ecourts_data = ecourts_service.get_case_by_cnr(cnr_number)
    
    if 'error' in ecourts_data:
        return Response(ecourts_data, status=status.HTTP_400_BAD_REQUEST)
    
    # Parse eCourts data and create case
    # Note: This mapping depends on actual eCourts API response structure
    case_data = {
        'title': ecourts_data.get('case_title', 'Imported Case'),
        'cnr_number': cnr_number.upper().replace('-', ''),
        'case_type': _map_case_type(ecourts_data.get('case_type', '')),
        'description': ecourts_data.get('case_description', 'Imported from eCourts'),
        'court_name': ecourts_data.get('court_name', ''),
        'judge_name': ecourts_data.get('judge_name', ''),
        'filing_date': ecourts_data.get('filing_date'),
        'status': _map_status(ecourts_data.get('case_status', '')),
    }
    
    if advocate_id:
        case_data['advocate'] = advocate_id
    
    serializer = CaseCreateSerializer(data=case_data, context={'request': request})
    if serializer.is_valid():
        case = serializer.save(customer=request.user)
        return Response({
            'message': 'Case imported successfully',
            'case_id': str(case.id),
            'cnr': case.cnr_number,
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def search_ecourts_cases(request):
    """
    GET /api/ecourts/search/?court_code=...&case_type=...&filing_year=...
    
    Search cases on eCourts
    """
    params = {
        'court_code': request.query_params.get('court_code'),
        'case_type': request.query_params.get('case_type'),
        'filing_year': request.query_params.get('filing_year'),
        'litigant_name': request.query_params.get('litigant_name'),
        'advocate_name': request.query_params.get('advocate_name'),
    }
    
    # Remove None values
    params = {k: v for k, v in params.items() if v is not None}
    
    if not params:
        return Response(
            {'error': 'At least one search parameter is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Convert filing_year to int if present
    if 'filing_year' in params:
        try:
            params['filing_year'] = int(params['filing_year'])
        except ValueError:
            return Response(
                {'error': 'filing_year must be a number'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    result = ecourts_service.search_cases(**params)
    
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_cause_list(request):
    """
    GET /api/ecourts/causelist/?court_code=...&date=2024-01-15
    
    Get cause list for a court
    """
    court_code = request.query_params.get('court_code')
    date = request.query_params.get('date')
    
    if not court_code or not date:
        return Response(
            {'error': 'Both court_code and date are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    result = ecourts_service.get_cause_list(court_code, date)
    
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(result)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_ecourts_status(request):
    """
    GET /api/ecourts/status/
    
    Check eCourts API configuration status
    """
    result = ecourts_service.get_status()
    
    if 'error' in result:
        return Response(result, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(result)


def _map_case_type(ecourts_type: str) -> str:
    """Map eCourts case type to local case type"""
    mapping = {
        'civil': 'civil',
        'criminal': 'criminal',
        'family': 'family',
        'property': 'property',
        'corporate': 'corporate',
        'labour': 'labour',
        'consumer': 'consumer',
        'writ': 'writ',
    }
    ecourts_lower = ecourts_type.lower()
    return mapping.get(ecourts_lower, 'other')


def _map_status(ecourts_status: str) -> str:
    """Map eCourts status to local status"""
    mapping = {
        'pending': 'pending',
        'disposed': 'closed',
        'dismissed': 'dismissed',
        'allowed': 'closed',
        'rejected': 'dismissed',
    }
    ecourts_lower = ecourts_status.lower()
    return mapping.get(ecourts_lower, 'pending')
