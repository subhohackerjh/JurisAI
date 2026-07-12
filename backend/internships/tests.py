from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Internship, InternshipApplication
from payments.models import Payment
from messaging.models import Conversation

User = get_user_model()


def make_cv():
    return SimpleUploadedFile('cv.pdf', b'%PDF-1.4 fake cv content', content_type='application/pdf')


class InternshipsAPITestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.advocate = User.objects.create_user(
            email='advocate@test.com', name='Advocate One', password='testpass123',
            role='advocate', specialization='Criminal Law', bar_council='Bar Council of Delhi',
            approval_status='approved', is_active=True,
        )
        self.other_advocate = User.objects.create_user(
            email='advocate2@test.com', name='Advocate Two', password='testpass123',
            role='advocate', specialization='Civil Law', bar_council='Bar Council of Delhi',
            approval_status='approved', is_active=True,
        )
        self.student = User.objects.create_user(
            email='student@test.com', name='Student One', password='testpass123',
            role='student', law_college='NLSIU', is_active=True,
        )
        self.internship = Internship.objects.create(
            advocate=self.advocate, title='Litigation Intern', description='Assist with cases',
        )

    def _pay_internship_fee(self, user):
        Payment.objects.create(
            order_id=f'L24_TEST_{user.id}', customer=user, advocate=None,
            payment_for='internship_fee', amount='399.00', currency='INR', status='paid',
        )

    def test_apply_blocked_without_paid_fee(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f'/api/internships/{self.internship.id}/apply/',
            {'cv': make_cv(), 'cover_note': 'I am interested'},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(InternshipApplication.objects.count(), 0)

    def test_apply_succeeds_after_paid_fee(self):
        self._pay_internship_fee(self.student)
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f'/api/internships/{self.internship.id}/apply/',
            {'cv': make_cv(), 'cover_note': 'I am interested'},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(InternshipApplication.objects.count(), 1)

    def test_duplicate_application_rejected(self):
        self._pay_internship_fee(self.student)
        self.client.force_authenticate(user=self.student)
        self.client.post(
            f'/api/internships/{self.internship.id}/apply/',
            {'cv': make_cv(), 'cover_note': 'First'},
            format='multipart',
        )
        response = self.client.post(
            f'/api/internships/{self.internship.id}/apply/',
            {'cv': make_cv(), 'cover_note': 'Second'},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(InternshipApplication.objects.count(), 1)

    def test_offer_letter_rejected_for_non_owning_advocate(self):
        self._pay_internship_fee(self.student)
        application = InternshipApplication.objects.create(
            internship=self.internship, student=self.student, cv=make_cv(), status='selected',
        )
        self.client.force_authenticate(user=self.other_advocate)
        offer = SimpleUploadedFile('offer.pdf', b'%PDF-1.4 offer', content_type='application/pdf')
        response = self.client.post(
            f'/api/internships/applications/{application.id}/offer-letter/',
            {'offer_letter': offer},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_offer_letter_rejected_before_selected(self):
        application = InternshipApplication.objects.create(
            internship=self.internship, student=self.student, cv=make_cv(), status='pending',
        )
        self.client.force_authenticate(user=self.advocate)
        offer = SimpleUploadedFile('offer.pdf', b'%PDF-1.4 offer', content_type='application/pdf')
        response = self.client.post(
            f'/api/internships/applications/{application.id}/offer-letter/',
            {'offer_letter': offer},
            format='multipart',
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_selecting_applicant_creates_conversation(self):
        application = InternshipApplication.objects.create(
            internship=self.internship, student=self.student, cv=make_cv(), status='pending',
        )
        self.client.force_authenticate(user=self.advocate)
        response = self.client.patch(
            f'/api/internships/applications/{application.id}/status/',
            {'status': 'selected'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(
            Conversation.objects.filter(customer=self.student, advocate=self.advocate).exists()
        )

    def test_chat_blocked_before_selection(self):
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/messaging/conversations/start/{self.advocate.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_chat_allowed_after_selection(self):
        InternshipApplication.objects.create(
            internship=self.internship, student=self.student, cv=make_cv(), status='selected',
        )
        self.client.force_authenticate(user=self.student)
        response = self.client.post(f'/api/messaging/conversations/start/{self.advocate.id}/')
        self.assertIn(response.status_code, (status.HTTP_200_OK, status.HTTP_201_CREATED))
