import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()


class Feedback(models.Model):
    FEEDBACK_TYPE_CHOICES = [
        ('general', 'General Feedback'),
        ('bug_report', 'Bug Report'),
        ('feature_request', 'Feature Request'),
        ('complaint', 'Complaint'),
        ('compliment', 'Compliment'),
        ('support', 'Support Request'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    STATUS_CHOICES = [
        ('new', 'New'),
        ('under_review', 'Under Review'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks')
    
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES, default='general')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    
    # For advocates - related to case or draft
    related_case = models.ForeignKey('cases.Case', on_delete=models.SET_NULL, 
                                      related_name='feedbacks', blank=True, null=True)
    related_draft = models.ForeignKey('cases.DraftRequest', on_delete=models.SET_NULL,
                                        related_name='feedbacks', blank=True, null=True)
    
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    # Admin fields
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, 
                                     related_name='assigned_feedbacks', 
                                     blank=True, null=True,
                                     limit_choices_to={'role': 'admin'})
    admin_notes = models.TextField(blank=True, null=True)
    resolution = models.TextField(blank=True, null=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    # Contact preference
    contact_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'feedback_feedback'
        ordering = ['-created_at']
        verbose_name_plural = 'Feedback'
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['status']),
            models.Index(fields=['feedback_type']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.subject} - {self.user.name}"


class FeedbackResponse(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    feedback = models.ForeignKey(Feedback, on_delete=models.CASCADE, related_name='responses')
    responder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedback_responses')
    message = models.TextField()
    is_internal = models.BooleanField(default=False)  # True for admin-only notes
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'feedback_feedbackresponse'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Response to {self.feedback.subject} by {self.responder.name}"


class AdvocateRating(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_given',
                                  limit_choices_to={'role': 'customer'})
    advocate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings_received',
                                  limit_choices_to={'role': 'advocate'})
    
    # Related to case or draft
    related_case = models.ForeignKey('cases.Case', on_delete=models.CASCADE, 
                                      related_name='advocate_ratings', blank=True, null=True)
    related_draft = models.ForeignKey('cases.DraftRequest', on_delete=models.CASCADE,
                                      related_name='advocate_ratings', blank=True, null=True)
    
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True, null=True)
    
    # Rating categories
    professionalism = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    communication = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    expertise = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    timeliness = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    
    is_verified = models.BooleanField(default=False)  # Verified by admin
    is_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'feedback_advocaterating'
        ordering = ['-created_at']
        unique_together = [
            ['customer', 'related_case'],
            ['customer', 'related_draft'],
        ]
    
    def __str__(self):
        return f"{self.rating} stars for {self.advocate.name} by {self.customer.name}"


class SystemRating(models.Model):
    """Overall system/app rating by users"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='system_ratings')
    
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True, null=True)
    
    # Category ratings
    ease_of_use = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    features = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    support = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        blank=True, null=True
    )
    
    would_recommend = models.BooleanField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'feedback_systemrating'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.rating} stars from {self.user.name}"
