from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from feedback.models import Feedback, FeedbackResponse, AdvocateRating, SystemRating

User = get_user_model()


class FeedbackAPITestCase(TestCase):
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
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin User',
            password='testpass123',
            role='admin',
            is_staff=True
        )
        # Create a test case to associate with ratings
        from cases.models import Case
        self.case = Case.objects.create(
            customer=self.customer_user,
            advocate=self.advocate_user,
            title='Test Case',
            case_type='civil',
            description='Test Case Description'
        )

    def test_create_feedback(self):
        """Test creating feedback"""
        self.client.force_authenticate(user=self.customer_user)
        data = {
            'feedback_type': 'bug_report',
            'subject': 'Test Bug',
            'message': 'This is a test bug report',
            'contact_email': 'customer@test.com',
            'contact_phone': '+919876543210'
        }
        response = self.client.post('/api/feedback/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Feedback.objects.count(), 1)

    def test_list_feedback(self):
        """Test listing feedback"""
        Feedback.objects.create(
            user=self.customer_user,
            feedback_type='bug_report',
            subject='Test Bug',
            message='Test message'
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/feedback/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_create_advocate_rating(self):
        """Test creating advocate rating"""
        self.client.force_authenticate(user=self.customer_user)
        data = {
            'advocate': self.advocate_user.id,
            'related_case': str(self.case.id),
            'rating': 5,
            'communication': 5,
            'professionalism': 5,
            'expertise': 5,
            'timeliness': 5,
            'review': 'Excellent service'
        }
        response = self.client.post('/api/feedback/ratings/advocate/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AdvocateRating.objects.count(), 1)

    def test_create_system_rating(self):
        """Test creating system rating"""
        self.client.force_authenticate(user=self.customer_user)
        data = {
            'rating': 4,
            'ease_of_use': 4,
            'features': 4,
            'support': 4,
            'comment': 'Good platform'
        }
        response = self.client.post('/api/feedback/ratings/system/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SystemRating.objects.count(), 1)

    def test_get_advocate_rating_summary(self):
        """Test getting advocate rating summary"""
        AdvocateRating.objects.create(
            customer=self.customer_user,
            advocate=self.advocate_user,
            related_case=self.case,
            rating=5,
            communication=5,
            professionalism=5,
            expertise=5,
            timeliness=5
        )
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get(f'/api/feedback/ratings/advocate/{self.advocate_user.id}/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('average_rating', response.data)

    def test_get_system_rating_summary(self):
        """Test getting system rating summary"""
        SystemRating.objects.create(
            user=self.customer_user,
            rating=4,
            ease_of_use=4,
            features=4,
            support=4
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/feedback/ratings/system/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('average_rating', response.data)

    def test_get_feedback_stats(self):
        """Test getting feedback statistics"""
        Feedback.objects.create(
            user=self.customer_user,
            feedback_type='bug_report',
            subject='Test Bug',
            message='Test message',
            status='new'
        )
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/feedback/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('by_status', response.data)
