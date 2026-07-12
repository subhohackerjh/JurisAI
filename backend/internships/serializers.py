import os
from rest_framework import serializers
from .models import Internship, InternshipApplication
from accounts.serializers import UserSerializer

ALLOWED_DOCUMENT_EXTENSIONS = {'.pdf', '.doc', '.docx'}
ALLOWED_DOCUMENT_MIME_PREFIXES = ('application/pdf', 'application/msword', 'application/vnd.openxmlformats')
MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10 MB


def validate_document_file(value):
    if value.size > MAX_DOCUMENT_SIZE:
        raise serializers.ValidationError(
            f'File too large. Maximum allowed size is {MAX_DOCUMENT_SIZE // (1024*1024)} MB.'
        )
    ext = os.path.splitext(value.name)[1].lower()
    if ext not in ALLOWED_DOCUMENT_EXTENSIONS:
        raise serializers.ValidationError(
            f'Unsupported file type "{ext}". Allowed: {", ".join(sorted(ALLOWED_DOCUMENT_EXTENSIONS))}'
        )
    content_type = getattr(value, 'content_type', '')
    if content_type and not any(content_type.startswith(p) for p in ALLOWED_DOCUMENT_MIME_PREFIXES):
        raise serializers.ValidationError(
            f'File content type "{content_type}" is not allowed.'
        )
    return value


class InternshipSerializer(serializers.ModelSerializer):
    advocate_name = serializers.CharField(source='advocate.name', read_only=True)
    advocate_specialization = serializers.CharField(source='advocate.specialization', read_only=True)
    advocate_rating = serializers.DecimalField(source='advocate.rating', read_only=True, max_digits=3, decimal_places=2)
    applications_count = serializers.SerializerMethodField()

    class Meta:
        model = Internship
        fields = [
            'id', 'advocate', 'advocate_name', 'advocate_specialization', 'advocate_rating',
            'title', 'description', 'practice_area', 'duration_months', 'stipend',
            'openings', 'status', 'applications_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'advocate', 'created_at', 'updated_at']

    def get_applications_count(self, obj):
        return obj.applications.count()

    def create(self, validated_data):
        validated_data['advocate'] = self.context['request'].user
        return super().create(validated_data)


class InternshipApplicationSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    internship_title = serializers.CharField(source='internship.title', read_only=True)
    advocate_id = serializers.CharField(source='internship.advocate_id', read_only=True)
    advocate_name = serializers.CharField(source='internship.advocate.name', read_only=True)
    cv_url = serializers.SerializerMethodField()
    offer_letter_url = serializers.SerializerMethodField()

    class Meta:
        model = InternshipApplication
        fields = [
            'id', 'internship', 'internship_title', 'advocate_id', 'advocate_name',
            'student', 'cv', 'cv_url', 'cover_note', 'status',
            'offer_letter_url', 'offer_sent_at',
            'applied_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'internship', 'student', 'status', 'offer_sent_at',
            'applied_at', 'updated_at',
        ]
        extra_kwargs = {'cv': {'write_only': True}}

    def validate_cv(self, value):
        return validate_document_file(value)

    def get_cv_url(self, obj):
        if obj.cv:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.cv.url) if request else obj.cv.url
        return None

    def get_offer_letter_url(self, obj):
        if obj.offer_letter:
            request = self.context.get('request')
            return request.build_absolute_uri(obj.offer_letter.url) if request else obj.offer_letter.url
        return None


class InternshipApplicationStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipApplication
        fields = ['status']

    def validate_status(self, value):
        if value not in ('shortlisted', 'selected', 'rejected'):
            raise serializers.ValidationError('Status must be one of: shortlisted, selected, rejected.')
        return value


class OfferLetterUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = InternshipApplication
        fields = ['offer_letter']

    def validate_offer_letter(self, value):
        return validate_document_file(value)
