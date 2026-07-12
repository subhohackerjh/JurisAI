from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from django.urls import reverse
import json

User = get_user_model()


class AccountsAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            email='admin@test.com',
            name='Admin User',
            password='testpass123',
            role='admin',
            is_staff=True
        )
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
        self.pending_advocate = User.objects.create_user(
            email='pending@test.com',
            name='Pending Advocate',
            password='testpass123',
            role='advocate',
            specialization='Civil Law',
            experience_years=3,
            bar_council_id='BAR/5678/2020',
            approval_status='pending',
            is_active=False
        )

    def test_register_customer(self):
        """Test customer registration"""
        data = {
            'email': 'newcustomer@test.com',
            'name': 'New Customer',
            'role': 'customer',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['role'], 'customer')

    def test_register_advocate_pending(self):
        """Test advocate registration creates pending status"""
        data = {
            'email': 'newadvocate@test.com',
            'name': 'New Advocate',
            'role': 'advocate',
            'specialization': 'Family Law',
            'experience_years': 10,
            'bar_council_id': 'BAR/9999/2020',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_user = User.objects.get(email='newadvocate@test.com')
        self.assertEqual(new_user.approval_status, 'pending')
        self.assertFalse(new_user.is_active)

    def test_register_advocate_requires_fields(self):
        """Test advocate registration requires specialization and bar council id"""
        data = {
            'email': 'badadvocate@test.com',
            'name': 'Bad Advocate',
            'role': 'advocate',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_student(self):
        """Test student registration is active immediately, no approval gating"""
        data = {
            'email': 'newstudent@test.com',
            'name': 'New Student',
            'role': 'student',
            'law_college': 'NLSIU',
            'year_of_study': '3rd Year',
            'graduation_year': 2027,
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        new_user = User.objects.get(email='newstudent@test.com')
        self.assertTrue(new_user.is_active)
        self.assertEqual(new_user.law_college, 'NLSIU')

    def test_register_student_requires_law_college(self):
        """Test student registration requires law_college"""
        data = {
            'email': 'badstudent@test.com',
            'name': 'Bad Student',
            'role': 'student',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        response = self.client.post('/api/auth/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_success(self):
        """Test successful login"""
        data = {
            'email': 'customer@test.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('user', response.data)

    def test_login_pending_advocate_fails(self):
        """Test pending advocate cannot login"""
        data = {
            'email': 'pending@test.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/auth/login/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_profile_authenticated(self):
        """Test getting user profile when authenticated"""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'customer@test.com')

    def test_get_profile_unauthenticated(self):
        """Test getting profile without authentication fails"""
        response = self.client.get('/api/auth/profile/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_profile_returns_user_payload(self):
        """Profile update must return nested user object with profile fields"""
        from .models import UserProfile

        self.client.force_authenticate(user=self.admin_user)
        UserProfile.objects.get_or_create(
            user=self.admin_user,
            defaults={
                'address': 'Old Street',
                'city': 'Mumbai',
                'state': 'Maharashtra',
                'pincode': '400001',
                'bio': 'Admin bio',
            },
        )
        response = self.client.put(
            '/api/auth/profile/update/',
            {
                'name': 'Admin Updated',
                'phone': '9999999999',
                'address': 'New Street',
                'city': 'Pune',
                'state': 'Maharashtra',
                'pincode': '411001',
                'bio': 'Updated bio',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        user_data = response.data['user']
        self.assertEqual(user_data['name'], 'Admin Updated')
        self.assertEqual(user_data['phone'], '9999999999')
        self.assertEqual(user_data['address'], 'New Street')
        self.assertEqual(user_data['city'], 'Pune')
        self.assertEqual(user_data['pincode'], '411001')
        self.assertEqual(user_data['bio'], 'Updated bio')

    def test_change_password_authenticated(self):
        """Authenticated user can change password with current password"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.put(
            '/api/auth/password/change/',
            {
                'old_password': 'testpass123',
                'new_password': 'newpass12345',
                'new_password_confirm': 'newpass12345',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('message'), 'Password changed successfully')
        self.admin_user.refresh_from_db()
        self.assertTrue(self.admin_user.check_password('newpass12345'))

    def test_change_password_wrong_old_password(self):
        """Wrong current password is rejected"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.put(
            '/api/auth/password/change/',
            {
                'old_password': 'wrongpassword',
                'new_password': 'newpass12345',
                'new_password_confirm': 'newpass12345',
            },
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('old_password', response.data)

    def test_list_advocates(self):
        """Test listing advocates"""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get('/api/auth/advocates/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertIsInstance(response.data['results'], list)

    def test_list_pending_advocates_admin(self):
        """Test admin can list pending advocates"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get('/api/auth/advocates/pending/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)

    def test_list_pending_advocates_non_admin_fails(self):
        """Test non-admin cannot list pending advocates"""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.get('/api/auth/advocates/pending/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approve_advocate_admin(self):
        """Test admin can approve advocate"""
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(f'/api/auth/advocates/{self.pending_advocate.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.pending_advocate.refresh_from_db()
        self.assertEqual(self.pending_advocate.approval_status, 'approved')
        self.assertTrue(self.pending_advocate.is_active)

    def test_approve_advocate_non_admin_fails(self):
        """Test non-admin cannot approve advocate"""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.post(f'/api/auth/advocates/{self.pending_advocate.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reject_advocate_admin(self):
        """Test admin can reject advocate with reason"""
        self.client.force_authenticate(user=self.admin_user)
        data = {'rejection_reason': 'Invalid Bar Council ID'}
        response = self.client.post(f'/api/auth/advocates/{self.pending_advocate.id}/reject/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.pending_advocate.refresh_from_db()
        self.assertEqual(self.pending_advocate.approval_status, 'rejected')
        self.assertFalse(self.pending_advocate.is_active)
        self.assertEqual(self.pending_advocate.rejection_reason, 'Invalid Bar Council ID')

    def test_reject_advocate_non_admin_fails(self):
        """Test non-admin cannot reject advocate"""
        self.client.force_authenticate(user=self.customer_user)
        response = self.client.post(f'/api/auth/advocates/{self.pending_advocate.id}/reject/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_user_stats(self):
        """Test getting user stats"""
        self.client.force_authenticate(user=self.advocate_user)
        response = self.client.get('/api/auth/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('role', response.data)
