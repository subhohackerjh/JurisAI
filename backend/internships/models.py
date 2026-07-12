import uuid
from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Internship(models.Model):
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('closed', 'Closed'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    advocate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='internships_posted',
                                  limit_choices_to={'role': 'advocate'})

    title = models.CharField(max_length=255)
    description = models.TextField()
    practice_area = models.CharField(max_length=255, blank=True, null=True)
    duration_months = models.PositiveIntegerField(blank=True, null=True)
    stipend = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    openings = models.PositiveIntegerField(default=1)

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='open')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'internships_internship'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['advocate']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.title} ({self.advocate.name})"


class InternshipApplication(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('shortlisted', 'Shortlisted'),
        ('selected', 'Selected'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    internship = models.ForeignKey(Internship, on_delete=models.CASCADE, related_name='applications')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='internship_applications',
                                 limit_choices_to={'role': 'student'})

    cv = models.FileField(upload_to='internship_cvs/%Y/%m/')
    cover_note = models.TextField(blank=True)

    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')

    offer_letter = models.FileField(upload_to='offer_letters/%Y/%m/', blank=True, null=True)
    offer_sent_at = models.DateTimeField(blank=True, null=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'internships_internshipapplication'
        ordering = ['-applied_at']
        unique_together = ('internship', 'student')
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.student.name} -> {self.internship.title} ({self.status})"
