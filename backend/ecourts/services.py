"""
eCourts API Integration Service
Integrates with eCourts India API to fetch case details
"""
import os
import requests
import hashlib
import json
from typing import Optional, Dict, Any, List
from django.conf import settings
from django.core.cache import cache
from datetime import datetime, timedelta


class ECourtsService:
    """Service to interact with eCourts India API"""
    
    # Cache durations (in seconds)
    CACHE_DURATIONS = {
        'case_by_cnr': 3600 * 24,  # 24 hours - case details don't change frequently
        'search_cases': 3600 * 6,   # 6 hours - search results
        'cause_list': 3600 * 2,     # 2 hours - cause lists change daily
        'status': 3600 * 24,        # 24 hours - API status rarely changes
    }
    
    # Rate limiting
    RATE_LIMITS = {
        'case_by_cnr': 100,         # 100 requests per hour
        'search_cases': 50,         # 50 requests per hour
        'cause_list': 200,          # 200 requests per hour
        'status': 1000,             # 1000 requests per hour
    }
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or getattr(settings, 'ECOURTS_API_KEY', os.getenv('ECOURTS_API_KEY', ''))
        self.base_url = getattr(settings, 'ECOURTS_BASE_URL', 'https://api.ecourts.gov.in')
    
    def _get_cache_key(self, method: str, **kwargs) -> str:
        """Generate cache key for API calls"""
        # Create a deterministic key from method name and parameters
        key_data = f"ecourts_{method}_{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def _get_rate_limit_key(self, method: str) -> str:
        """Generate rate limit key for API calls"""
        hour_key = datetime.now().strftime('%Y-%m-%d-%H')
        return f"ecourts_rate_{method}_{hour_key}"
    
    def _check_rate_limit(self, method: str) -> bool:
        """Check if rate limit is exceeded"""
        rate_limit_key = self._get_rate_limit_key(method)
        current_count = cache.get(rate_limit_key, 0)
        return current_count < self.RATE_LIMITS.get(method, 100)
    
    def _increment_rate_limit(self, method: str):
        """Increment rate limit counter"""
        rate_limit_key = self._get_rate_limit_key(method)
        current_count = cache.get(rate_limit_key, 0)
        cache.set(rate_limit_key, current_count + 1, timeout=3600)  # 1 hour expiry
    
    def _get_cached_response(self, cache_key: str) -> Optional[Dict[str, Any]]:
        """Get response from cache"""
        return cache.get(cache_key)
    
    def _set_cache_response(self, cache_key: str, response: Dict[str, Any], method: str):
        """Set response in cache"""
        duration = self.CACHE_DURATIONS.get(method, 3600)
        cache.set(cache_key, response, timeout=duration)
    
    def clear_cache(self, method: Optional[str] = None, **kwargs):
        """Clear cache for specific method or all eCourts cache"""
        if method:
            cache_key = self._get_cache_key(method, **kwargs)
            cache.delete(cache_key)
        else:
            # Clear all eCourts cache (use with caution)
            # This is a simplified approach - in production, consider using cache versioning
            pass
        
    def get_case_by_cnr(self, cnr_number: str) -> Dict[str, Any]:
        """
        Fetch case details by CNR number from eCourts API
        
        Args:
            cnr_number: 16-character CNR (e.g., KAMS01-123456-2023)
            
        Returns:
            Dict containing case details
        """
        method_name = 'case_by_cnr'
        
        # Check rate limit first
        if not self._check_rate_limit(method_name):
            return {'error': 'Rate limit exceeded. Please try again later.'}
        
        if not self.api_key:
            return {'error': 'eCourts API key not configured'}
        
        # Clean CNR number (remove hyphens if present)
        cnr_clean = cnr_number.replace('-', '').replace(' ', '').upper()
        
        # Validate CNR format
        if len(cnr_clean) != 16:
            return {'error': 'Invalid CNR number. Must be 16 characters.'}
        
        # Check cache first
        cache_key = self._get_cache_key(method_name, cnr=cnr_clean)
        cached_response = self._get_cached_response(cache_key)
        if cached_response:
            return cached_response
        
        # Increment rate limit counter
        self._increment_rate_limit(method_name)
        
        try:
            # This is a placeholder - actual endpoint will depend on eCourts API documentation
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }
            
            # Note: Actual eCourts API endpoint structure may differ
            # This is a mock implementation that can be updated with real API details
            response = requests.get(
                f'{self.base_url}/api/case/details',
                headers=headers,
                params={'cnr': cnr_clean},
                timeout=30
            )
            
            result = None
            if response.status_code == 200:
                result = response.json()
                # Cache successful response
                self._set_cache_response(cache_key, result, method_name)
            elif response.status_code == 404:
                result = {'error': 'Case not found'}
                # Cache "not found" responses for shorter duration
                cache.set(cache_key, result, timeout=3600)  # 1 hour
            elif response.status_code == 401:
                result = {'error': 'Invalid API key'}
            else:
                result = {'error': f'API error: {response.status_code}'}
            
            return result
                
        except requests.exceptions.Timeout:
            result = {'error': 'Request timeout'}
            # Cache timeout errors for short duration
            cache.set(cache_key, result, timeout=300)  # 5 minutes
            return result
        except requests.exceptions.RequestException as e:
            result = {'error': f'Request failed: {str(e)}'}
            # Cache network errors for short duration
            cache.set(cache_key, result, timeout=300)  # 5 minutes
            return result
    
    def search_cases(
        self,
        court_code: Optional[str] = None,
        case_type: Optional[str] = None,
        filing_year: Optional[int] = None,
        litigant_name: Optional[str] = None,
        advocate_name: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Search cases on eCourts
        
        Returns:
            List of matching cases
        """
        method_name = 'search_cases'
        
        # Check rate limit first
        if not self._check_rate_limit(method_name):
            return {'error': 'Rate limit exceeded. Please try again later.'}
        
        if not self.api_key:
            return {'error': 'eCourts API key not configured'}
        
        params = {}
        if court_code:
            params['court_code'] = court_code
        if case_type:
            params['case_type'] = case_type
        if filing_year:
            params['filing_year'] = filing_year
        if litigant_name:
            params['litigant_name'] = litigant_name
        if advocate_name:
            params['advocate_name'] = advocate_name
        
        # Check cache first
        cache_key = self._get_cache_key(method_name, **params)
        cached_response = self._get_cached_response(cache_key)
        if cached_response:
            return cached_response
        
        # Increment rate limit counter
        self._increment_rate_limit(method_name)
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }
            
            # Placeholder endpoint - update with actual eCourts API
            response = requests.get(
                f'{self.base_url}/api/case/search',
                headers=headers,
                params=params,
                timeout=30
            )
            
            result = None
            if response.status_code == 200:
                result = response.json()
                # Cache successful response
                self._set_cache_response(cache_key, result, method_name)
            else:
                result = {'error': f'API error: {response.status_code}'}
                # Cache error responses for short duration
                cache.set(cache_key, result, timeout=300)  # 5 minutes
                
            return result
                
        except requests.exceptions.RequestException as e:
            result = {'error': f'Request failed: {str(e)}'}
            # Cache network errors for short duration
            cache.set(cache_key, result, timeout=300)  # 5 minutes
            return result
    
    def get_cause_list(
        self,
        court_code: str,
        date: str,
    ) -> Dict[str, Any]:
        """
        Get cause list for a court on a specific date
        
        Args:
            court_code: Court complex code
            date: Date in YYYY-MM-DD format
        """
        method_name = 'cause_list'
        
        # Check rate limit first
        if not self._check_rate_limit(method_name):
            return {'error': 'Rate limit exceeded. Please try again later.'}
        
        if not self.api_key:
            return {'error': 'eCourts API key not configured'}
        
        # Check cache first
        cache_key = self._get_cache_key(method_name, court_code=court_code, date=date)
        cached_response = self._get_cached_response(cache_key)
        if cached_response:
            return cached_response
        
        # Increment rate limit counter
        self._increment_rate_limit(method_name)
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }
            
            response = requests.get(
                f'{self.base_url}/api/causelist',
                headers=headers,
                params={'court_code': court_code, 'date': date},
                timeout=30
            )
            
            result = None
            if response.status_code == 200:
                result = response.json()
                # Cache successful response
                self._set_cache_response(cache_key, result, method_name)
            else:
                result = {'error': f'API error: {response.status_code}'}
                # Cache error responses for short duration
                cache.set(cache_key, result, timeout=300)  # 5 minutes
                
            return result
                
        except requests.exceptions.RequestException as e:
            result = {'error': f'Request failed: {str(e)}'}
            # Cache network errors for short duration
            cache.set(cache_key, result, timeout=300)  # 5 minutes
            return result
    
    def get_status(self) -> Dict[str, Any]:
        """
        Get eCourts API status
        
        Returns:
            API status information
        """
        method_name = 'status'
        
        # Check rate limit first
        if not self._check_rate_limit(method_name):
            return {'error': 'Rate limit exceeded. Please try again later.'}
        
        # Check cache first
        cache_key = self._get_cache_key(method_name)
        cached_response = self._get_cached_response(cache_key)
        if cached_response:
            return cached_response
        
        # Increment rate limit counter
        self._increment_rate_limit(method_name)
        
        if not self.api_key:
            return {
                'configured': False,
                'has_api_key': False,
                'message': 'eCourts API key not configured'
            }
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json',
            }
            
            response = requests.get(
                f'{self.base_url}/api/status',
                headers=headers,
                timeout=10
            )
            
            result = None
            if response.status_code == 200:
                result = response.json()
                result['configured'] = True
                result['has_api_key'] = True
                # Cache successful response
                self._set_cache_response(cache_key, result, method_name)
            else:
                result = {
                    'configured': False,
                    'has_api_key': True,
                    'message': f'API error: {response.status_code}'
                }
                # Cache error responses for short duration
                cache.set(cache_key, result, timeout=300)  # 5 minutes
                
            return result
                
        except requests.exceptions.RequestException as e:
            result = {
                'configured': False,
                'has_api_key': True,
                'message': f'Request failed: {str(e)}'
            }
            # Cache network errors for short duration
            cache.set(cache_key, result, timeout=300)  # 5 minutes
            return result


# Singleton instance
ecourts_service = ECourtsService()
