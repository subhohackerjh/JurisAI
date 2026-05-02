from rest_framework import serializers
from .models import Feedback, FeedbackResponse, AdvocateRating, SystemRating
from accounts.serializers import UserSerializer


class FeedbackResponseSerializer(serializers.ModelSerializer):
    responder_name = serializers.CharField(source='responder.name', read_only=True)
    responder_role = serializers.CharField(source='responder.role', read_only=True)
    
    class Meta:
        model = FeedbackResponse
        fields = [
            'id', 'message', 'responder', 'responder_name', 'responder_role',
            'is_internal', 'created_at'
        ]
        read_only_fields = ['id', 'responder', 'created_at']


class FeedbackListSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    feedback_type_display = serializers.CharField(source='get_feedback_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    responses_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'subject', 'feedback_type', 'feedback_type_display',
            'status', 'status_display', 'priority', 'priority_display',
            'user', 'user_name', 'related_case', 'related_draft',
            'created_at', 'responses_count'
        ]
    
    def get_responses_count(self, obj):
        return obj.responses.filter(is_internal=False).count()


class FeedbackDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    assigned_to = UserSerializer(read_only=True)
    responses = FeedbackResponseSerializer(many=True, read_only=True)
    feedback_type_display = serializers.CharField(source='get_feedback_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'feedback_type', 'feedback_type_display', 'subject', 'message',
            'status', 'status_display', 'priority', 'priority_display',
            'user', 'related_case', 'related_draft', 'assigned_to',
            'admin_notes', 'resolution', 'resolved_at',
            'contact_email', 'contact_phone',
            'created_at', 'updated_at', 'responses'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            'feedback_type', 'subject', 'message',
            'related_case', 'related_draft',
            'contact_email', 'contact_phone'
        ]
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class FeedbackUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['status', 'priority', 'assigned_to', 'admin_notes', 'resolution']


class FeedbackResponseCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeedbackResponse
        fields = ['message', 'is_internal']
    
    def create(self, validated_data):
        feedback_id = self.context['view'].kwargs.get('feedback_pk')
        validated_data['feedback_id'] = feedback_id
        validated_data['responder'] = self.context['request'].user
        
        response = super().create(validated_data)
        
        # Update feedback status if not internal
        if not validated_data.get('is_internal', False):
            feedback = response.feedback
            if feedback.status == 'new':
                feedback.status = 'under_review'
                feedback.save()
        
        return response


class AdvocateRatingListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    advocate_name = serializers.CharField(source='advocate.name', read_only=True)
    
    class Meta:
        model = AdvocateRating
        fields = [
            'id', 'customer', 'customer_name', 'advocate', 'advocate_name',
            'rating', 'review', 'is_verified', 'is_public', 'created_at'
        ]


class AdvocateRatingDetailSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    advocate = UserSerializer(read_only=True)
    
    class Meta:
        model = AdvocateRating
        fields = [
            'id', 'customer', 'advocate', 'rating', 'review',
            'related_case', 'related_draft',
            'professionalism', 'communication', 'expertise', 'timeliness',
            'is_verified', 'is_public', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'customer', 'is_verified', 'created_at', 'updated_at']


class AdvocateRatingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AdvocateRating
        fields = [
            'advocate', 'related_case', 'related_draft',
            'rating', 'review',
            'professionalism', 'communication', 'expertise', 'timeliness'
        ]
    
    def validate(self, attrs):
        # Ensure either case or draft is provided
        if not attrs.get('related_case') and not attrs.get('related_draft'):
            raise serializers.ValidationError("Either related_case or related_draft must be provided")
        
        # Check if user has already rated
        customer = self.context['request'].user
        if attrs.get('related_case'):
            existing = AdvocateRating.objects.filter(
                customer=customer, 
                related_case=attrs['related_case']
            ).exists()
            if existing:
                raise serializers.ValidationError("You have already rated this case")
        
        if attrs.get('related_draft'):
            existing = AdvocateRating.objects.filter(
                customer=customer,
                related_draft=attrs['related_draft']
            ).exists()
            if existing:
                raise serializers.ValidationError("You have already rated this draft request")
        
        return attrs
    
    def create(self, validated_data):
        validated_data['customer'] = self.context['request'].user
        return super().create(validated_data)


class SystemRatingSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = SystemRating
        fields = [
            'id', 'user', 'user_name', 'rating', 'review',
            'ease_of_use', 'features', 'support', 'would_recommend',
            'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
