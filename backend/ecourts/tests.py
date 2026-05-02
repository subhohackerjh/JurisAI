from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from unittest.mock import patch, MagicMock

User = get_user_model()


class ECourtsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin User',
            password='testpass123',
            role='admin',
            is_staff=True
        )
        self.advocate_user = User.objects.create_user(
            email='advocate@test.com',
            name='Advocate User',
            password='testpass123',
            role='advocate',
            specialization='Criminal Law',
            experience_years=5,
            bar_council_id='BAR/1234/2020',
            approval_status='approved',
            is_active=True
        )

    def test_get_ecourts_status_authenticated(self):
        """Test getting eCourts API status when authenticated"""
        self.client.force_authenticate(user=self.admin_user)
        with patch('backend.ecourts.services.settings') as mock_settings:
            mock_settings.ECOURTS_API_KEY = 'test_key'
            response = self.client.get('/api/ecourts/status/')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
            self.assertIn('configured', response.data)

    def test_get_ecourts_status_unauthenticated(self):
        """Test getting eCourts status without authentication fails"""
        response = self.client.get('/api/ecourts/status/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('backend.ecourts.services.requests.get')
    def test_get_case_by_cnr(self, mock_get):
        """Test fetching case by CNR"""
        self.client.force_authenticate(user=self.admin_user)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'case_title': 'Test Case',
            'case_type': 'Civil',
            'cnr': 'TEST1234567890'
        }
        mock_get.return_value = mock_response

        response = self.client.get('/api/ecourts/case/?cnr=TEST1234567890')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)

    def test_get_case_by_cnr_unauthenticated(self):
        """Test fetching case by CNR without authentication fails"""
        response = self.client.get('/api/ecourts/case/?cnr=TEST1234567890')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('backend.ecourts.services.requests.get')
    def test_import_case_from_ecourts(self, mock_get):
        """Test importing case from eCourts"""
        self.client.force_authenticate(user=self.admin_user)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'case_title': 'Test Case',
            'case_type': 'Civil',
            'cnr': 'TEST1234567890'
        }
        mock_get.return_value = mock_response

        data = {
            'cnr': 'TEST1234567890',
            'advocate_id': str(self.advocate_user.id)
        }
        response = self.client.post('/api/ecourts/import/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)

    def test_import_case_unauthenticated(self):
        """Test importing case without authentication fails"""
        data = {'cnr': 'TEST1234567890'}
        response = self.client.post('/api/ecourts/import/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('backend.ecourts.services.requests.get')
    def test_search_ecourts_cases(self, mock_get):
        """Test searching eCourts cases"""
        self.client.force_authenticate(user=self.admin_user)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'results': [
                {'case_title': 'Test Case 1'},
                {'case_title': 'Test Case 2'}
            ]
        }
        mock_get.return_value = mock_response

        response = self.client.get('/api/ecourts/search/?court_code=DLHC01')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)

    def test_search_ecourts_unauthenticated(self):
        """Test searching eCourts without authentication fails"""
        response = self.client.get('/api/ecourts/search/?court_code=DLHC01')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch('backend.ecourts.services.requests.get')
    def test_get_cause_list(self, mock_get):
        """Test getting cause list"""
        self.client.force_authenticate(user=self.admin_user)
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            'cause_list': [
                {'case_number': 'CASE001'},
                {'case_number': 'CASE002'}
            ]
        }
        mock_get.return_value = mock_response

        response = self.client.get('/api/ecourts/causelist/?court_code=DLHC01&date=2024-01-01')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('data', response.data)

    def test_get_cause_list_unauthenticated(self):
        """Test getting cause list without authentication fails"""
        response = self.client.get('/api/ecourts/causelist/?court_code=DLHC01&date=2024-01-01')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
