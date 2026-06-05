from rest_framework import serializers
from .models import Case, CaseDocument, Hearing, CaseUpdate, DraftRequest
from accounts.serializers import UserSerializer


class CaseDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = CaseDocument
        fields = [
            'id', 'title', 'document_type', 'file', 'file_url', 'file_size',
            'uploaded_by', 'uploaded_by_name', 'description', 'created_at'
        ]
        read_only_fields = ['id', 'uploaded_by', 'created_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None


class HearingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hearing
        fields = [
            'id', 'hearing_date', 'hearing_type', 'court_room', 'judge_name',
            'purpose', 'outcome', 'next_date', 'is_completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CaseUpdateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = CaseUpdate
        fields = [
            'id', 'update_type', 'title', 'description', 'created_by', 'created_by_name',
            'old_status', 'new_status', 'is_customer_visible', 'created_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at']


class CaseListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    advocate_name = serializers.CharField(source='advocate.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    case_type_display = serializers.CharField(source='get_case_type_display', read_only=True)
    documents_count = serializers.SerializerMethodField()
    hearings_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Case
        fields = [
            'id', 'cnr_number', 'title', 'case_type', 'case_type_display',
            'status', 'status_display', 'customer', 'customer_name',
            'advocate', 'advocate_name', 'court_name', 'next_hearing_date',
            'filing_date', 'created_at', 'documents_count', 'hearings_count'
        ]
    
    def get_documents_count(self, obj):
        return obj.documents.count()
    
    def get_hearings_count(self, obj):
        return obj.hearings.count()


class CaseDetailSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    advocate = UserSerializer(read_only=True)
    documents = CaseDocumentSerializer(many=True, read_only=True)
    hearings = HearingSerializer(many=True, read_only=True)
    updates = CaseUpdateSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    case_type_display = serializers.CharField(source='get_case_type_display', read_only=True)
    
    class Meta:
        model = Case
        fields = [
            'id', 'cnr_number', 'title', 'case_type', 'case_type_display',
            'description', 'status', 'status_display', 'customer', 'advocate',
            'court_name', 'court_address', 'judge_name', 'filing_date',
            'next_hearing_date', 'registration_date', 'disposal_date',
            'advocate_fee', 'total_cost', 'is_active', 'is_public', 'priority',
            'created_at', 'updated_at', 'documents', 'hearings', 'updates'
        ]
        read_only_fields = ['id', 'cnr_number', 'created_at', 'updated_at']


class CaseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Case
        fields = [
            'title', 'case_type', 'description', 'advocate',
            'court_name', 'court_address', 'judge_name',
            'filing_date', 'advocate_fee'
        ]
    
    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


class CaseStatusUpdateSerializer(serializers.ModelSerializer):
    note = serializers.CharField(required=False, allow_blank=True, write_only=True)
    
    class Meta:
        model = Case
        fields = ['status', 'note']
    
    def update(self, instance, validated_data):
        old_status = instance.status
        new_status = validated_data.get('status', old_status)
        note = validated_data.pop('note', '')

        # Capture display names BEFORE super().update() changes instance.status
        status_choices = dict(Case.STATUS_CHOICES)
        old_status_display = status_choices.get(old_status, old_status)
        new_status_display = status_choices.get(new_status, new_status)

        instance = super().update(instance, validated_data)

        # Only create an update record when the status actually changed
        if old_status != new_status:
            CaseUpdate.objects.create(
                case=instance,
                update_type='status_change',
                title=f'Status changed from {old_status_display} to {new_status_display}',
                description=note or f'Case status updated to {new_status_display}',
                created_by=self.context['request'].user,
                old_status=old_status,
                new_status=new_status,
                is_customer_visible=True
            )
        elif note:
            # Same status but advocate added a note — record it separately
            CaseUpdate.objects.create(
                case=instance,
                update_type='note',
                title=f'Note added on {new_status_display}',
                description=note,
                created_by=self.context['request'].user,
                is_customer_visible=True
            )

        return instance


class DraftRequestListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    advocate_name = serializers.CharField(source='advocate.name', read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = DraftRequest
        fields = [
            'id', 'document_type', 'document_type_display', 'status', 'status_display',
            'customer', 'customer_name', 'advocate', 'advocate_name',
            'agreed_price', 'expected_delivery', 'delivered_date', 'created_at'
        ]


class DraftRequestDetailSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    advocate = UserSerializer(read_only=True)
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = DraftRequest
        fields = [
            'id', 'document_type', 'document_type_display', 'requirements',
            'additional_notes', 'status', 'status_display',
            'customer', 'advocate', 'agreed_price', 'expected_delivery',
            'delivered_date', 'draft_document', 'final_document',
            'created_at', 'updated_at'
        ]


class DraftRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DraftRequest
        fields = ['advocate', 'document_type', 'requirements', 'additional_notes']
    
    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        validated_data['status'] = 'pending'
        return super().create(validated_data)


class DraftRequestUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DraftRequest
        fields = ['status', 'agreed_price', 'expected_delivery', 'draft_document', 'final_document']
