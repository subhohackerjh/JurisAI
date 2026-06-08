import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator

User = get_user_model()


class Case(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('filed', 'Filed'),
        ('pending', 'Pending'),
        ('hearing', 'Hearing Scheduled'),
        ('evidence', 'Evidence Phase'),
        ('arguments', 'Arguments'),
        ('judgment', 'Judgment Pending'),
        ('closed', 'Closed'),
        ('dismissed', 'Dismissed'),
        ('appealed', 'Appealed'),
    ]
    
    CASE_TYPE_CHOICES = [
        ('civil', 'Civil'),
        ('criminal', 'Criminal'),
        ('family', 'Family'),
        ('property', 'Property'),
        ('corporate', 'Corporate'),
        ('labour', 'Labour'),
        ('consumer', 'Consumer'),
        ('writ', 'Writ'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    cnr_number = models.CharField(max_length=20, unique=True, blank=True, null=True)
    
    # Parties
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='customer_cases', 
                                  limit_choices_to={'role': 'customer'})
    advocate = models.ForeignKey(User, on_delete=models.SET_NULL, related_name='advocate_cases',
                                  limit_choices_to={'role': 'advocate'}, null=True, blank=True)
    
    # Case Details
    title = models.CharField(max_length=500)
    case_type = models.CharField(max_length=20, choices=CASE_TYPE_CHOICES, default='civil')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Court Information
    court_name = models.CharField(max_length=255, blank=True, null=True)
    court_address = models.TextField(blank=True, null=True)
    judge_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Dates
    filing_date = models.DateField(blank=True, null=True)
    next_hearing_date = models.DateTimeField(blank=True, null=True)
    registration_date = models.DateTimeField(blank=True, null=True)
    disposal_date = models.DateField(blank=True, null=True)
    
    # Financial
    advocate_fee = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=False)
    priority = models.PositiveSmallIntegerField(default=1, validators=[MinValueValidator(1)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cases_case'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['customer']),
            models.Index(fields=['advocate']),
            models.Index(fields=['status']),
            models.Index(fields=['cnr_number']),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
    
    def save(self, *args, **kwargs):
        if not self.cnr_number and self.status != 'draft':
            # Generate CNR number if not exists and case is filed
            from django.utils import timezone
            year = self.filing_date.year if self.filing_date else (self.created_at.year if self.created_at else timezone.now().year)
            self.cnr_number = f"CNR{year}{str(self.id)[:8].upper()}"
        super().save(*args, **kwargs)


class CaseDocument(models.Model):
    DOCUMENT_TYPE_CHOICES = [
        ('petition', 'Petition'),
        ('affidavit', 'Affidavit'),
        ('evidence', 'Evidence'),
        ('order', 'Court Order'),
        ('judgment', 'Judgment'),
        ('agreement', 'Agreement'),
        ('notice', 'Notice'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=255)
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='other')
    file = models.FileField(upload_to='case_documents/%Y/%m/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    description = models.TextField(blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cases_casedocument'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.case.title}"


class Hearing(models.Model):
    HEARING_TYPE_CHOICES = [
        ('mention', 'Mention'),
        ('arguments', 'Arguments'),
        ('evidence', 'Evidence'),
        ('cross_examination', 'Cross Examination'),
        ('judgment', 'Judgment'),
        ('miscellaneous', 'Miscellaneous'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='hearings')
    hearing_date = models.DateTimeField()
    hearing_type = models.CharField(max_length=20, choices=HEARING_TYPE_CHOICES, default='miscellaneous')
    court_room = models.CharField(max_length=50, blank=True, null=True)
    judge_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Details
    purpose = models.TextField()
    outcome = models.TextField(blank=True, null=True)
    next_date = models.DateTimeField(blank=True, null=True)
    
    # Status
    is_completed = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cases_hearing'
        ordering = ['-hearing_date']
        verbose_name_plural = 'Hearings'
    
    def __str__(self):
        return f"Hearing on {self.hearing_date} - {self.case.title}"


class CaseUpdate(models.Model):
    UPDATE_TYPE_CHOICES = [
        ('status_change', 'Status Change'),
        ('document_added', 'Document Added'),
        ('hearing_scheduled', 'Hearing Scheduled'),
        ('hearing_completed', 'Hearing Completed'),
        ('note', 'Note'),
        ('client_communication', 'Client Communication'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='updates')
    update_type = models.CharField(max_length=25, choices=UPDATE_TYPE_CHOICES, default='note')
    title = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # For status changes
    old_status = models.CharField(max_length=20, blank=True, null=True)
    new_status = models.CharField(max_length=20, blank=True, null=True)
    
    is_customer_visible = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'cases_caseupdate'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.case.title}"


class DraftRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('review', 'Under Review'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    DOCUMENT_TYPE_CHOICES = [
        ('contract', 'Contract Agreement'),
        ('notice', 'Legal Notice'),
        ('power_of_attorney', 'Power of Attorney'),
        ('will', 'Will & Testament'),
        ('partnership', 'Partnership Deed'),
        ('rental', 'Rental Agreement'),
        ('employment', 'Employment Contract'),
        ('nda', 'ND Agreement'),
        ('mou', 'Memorandum of Understanding'),
        ('complaint', 'Legal Complaint'),
        ('other', 'Other'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    customer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='draft_requests')
    advocate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='drafting_cases',
                                   limit_choices_to={'role': 'advocate'})
    
    document_type = models.CharField(max_length=25, choices=DOCUMENT_TYPE_CHOICES)
    requirements = models.TextField()
    additional_notes = models.TextField(blank=True, null=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Pricing
    agreed_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    
    # Delivery
    expected_delivery = models.DateField(blank=True, null=True)
    delivered_date = models.DateField(blank=True, null=True)
    
    # Documents — file upload (optional) OR AI-generated text
    draft_document = models.FileField(upload_to='drafts/%Y/%m/', blank=True, null=True)
    final_document = models.FileField(upload_to='drafts/final/%Y/%m/', blank=True, null=True)
    # AI-generated draft stored as text (advocate can submit this instead of a file)
    draft_text = models.TextField(blank=True, null=True, help_text='AI-generated or manually written draft text')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'cases_draftrequest'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.customer.name}"
