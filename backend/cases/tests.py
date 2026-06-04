from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
import datetime
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from cases.models import Case, CaseDocument, Hearing, CaseUpdate, DraftRequest

User = get_user_model()


class CasesAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.customer_user = User.objects.create_user(
            email='customer@test.com',
            name='Customer User',
            password='testpass123',
            role='customer'
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
        self.test_case = Case.objects.create(
            title='Test Case',
            description='Test case description',
            case_type='criminal',
            status='pending',
            customer=self.customer_user,
            advocate=self.advocate_user
        )

    def test_create_case(self):
        """Test creating a new case"""
        self.client.force_authenticate(user=self.customer_user)
        data = {
            'title': 'New Case',
            'description': 'New case description',
            'case_type': 'civil',
            'status': 'pending'
        }
        response = self.client.post('/api/cases/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Case.objects.count(), 2)

    def test_list_cases(self):
        """Test listing cases"""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get('/api/cases/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_get_case_detail(self):
        """Test getting case details"""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(f'/api/cases/{self.test_case.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], 'Test Case')

    def test_update_case_status(self):
        """Test updating case status"""
        self.client.force_authenticate(user=self.advocate_user)
        data = {'status': 'hearing'}
        response = self.client.patch(f'/api/cases/{self.test_case.id}/status/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.test_case.refresh_from_db()
        self.assertEqual(self.test_case.status, 'hearing')

    def test_create_case_document(self):
        """Test creating a case document"""
        self.client.force_authenticate(user=self.advocate_user)
        test_file = SimpleUploadedFile(
            "test_doc.pdf",
            b"dummy content",
            content_type="application/pdf"
        )
        data = {
            'title': 'Test Document',
            'description': 'Test document description',
            'document_type': 'petition',
            'file': test_file
        }
        response = self.client.post(f'/api/cases/{self.test_case.id}/documents/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_case_documents(self):
        """Test listing case documents"""
        CaseDocument.objects.create(
            case=self.test_case,
            title='Test Document',
            description='Test description',
            document_type='petition',
            uploaded_by=self.advocate_user
        )
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(f'/api/cases/{self.test_case.id}/documents/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_hearing(self):
        """Test creating a hearing"""
        self.client.force_authenticate(user=self.advocate_user)
        data = {
            'hearing_date': (timezone.now() + datetime.timedelta(days=5)).isoformat(),
            'court_room': 'Test Court Room',
            'purpose': 'Test hearing'
        }
        response = self.client.post(f'/api/cases/{self.test_case.id}/hearings/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_hearings(self):
        """Test listing hearings"""
        Hearing.objects.create(
            case=self.test_case,
            hearing_date=timezone.now() + datetime.timedelta(days=5),
            court_room='Test Court Room',
            purpose='Test hearing purpose'
        )
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(f'/api/cases/{self.test_case.id}/hearings/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_case_update(self):
        """Test creating a case update"""
        self.client.force_authenticate(user=self.advocate_user)
        data = {
            'title': 'Case Update',
            'description': 'Case progress update'
        }
        response = self.client.post(f'/api/cases/{self.test_case.id}/updates/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_draft_request(self):
        """Test creating a draft request"""
        self.client.force_authenticate(user=self.customer_user)
        data = {
            'requirements': 'Need a legal document drafted',
            'document_type': 'notice',
            'advocate': self.advocate_user.id
        }
        response = self.client.post('/api/cases/drafts/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_list_draft_requests(self):
        """Test listing draft requests"""
        DraftRequest.objects.create(
            customer=self.customer_user,
            advocate=self.advocate_user,
            requirements='Test draft',
            document_type='notice'
        )
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get('/api/cases/drafts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_search_cases(self):
        """Test searching cases"""
        self.client.force_authenticate(user=self.advocate_user)
        response = self.client.get('/api/cases/search/?q=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_dashboard_stats(self):
        """Test getting dashboard statistics"""
        self.client.force_authenticate(user=self.advocate_user)
        response = self.client.get('/api/cases/dashboard/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_access_fails(self):
        """Test that unauthenticated access fails"""
        response = self.client.get('/api/cases/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
