from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    # Profile fields (read-only, from related UserProfile)
    address = serializers.SerializerMethodField()
    pincode = serializers.SerializerMethodField()
    bio = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    state = serializers.SerializerMethodField()
    consultation_fee = serializers.SerializerMethodField()
    availability = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'role', 'phone',
            'specialization', 'experience_years', 'bar_council_id',
            'rating', 'cases_handled', 'badge_number', 'station',
            'approval_status', 'rejection_reason',
            'is_active', 'date_joined', 'last_login',
            # Profile fields
            'address', 'pincode', 'bio', 'city', 'state', 'consultation_fee', 'availability',
        ]
        read_only_fields = [
            'id', 'date_joined', 'last_login', 'rating', 'cases_handled',
            'approval_status', 'rejection_reason',
            'address', 'pincode', 'bio', 'city', 'state', 'consultation_fee', 'availability',
        ]

    def _get_profile(self, obj):
        try:
            return obj.profile
        except Exception:
            return None

    def get_address(self, obj):
        p = self._get_profile(obj)
        return p.address if p else None

    def get_pincode(self, obj):
        p = self._get_profile(obj)
        return p.pincode if p else None

    def get_bio(self, obj):
        p = self._get_profile(obj)
        return p.bio if p else None

    def get_city(self, obj):
        p = self._get_profile(obj)
        return p.city if p else None

    def get_state(self, obj):
        p = self._get_profile(obj)
        return p.state if p else None

    def get_consultation_fee(self, obj):
        p = self._get_profile(obj)
        return str(p.consultation_fee) if p and p.consultation_fee else None

    def get_availability(self, obj):
        p = self._get_profile(obj)
        return p.availability if p else 'Available'


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'name', 'role', 'phone', 'password', 'password_confirm',
            'specialization', 'experience_years', 'bar_council_id',
            'badge_number', 'station'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        
        # Role-specific validation
        role = attrs.get('role')
        if role == 'advocate':
            if not attrs.get('specialization'):
                raise serializers.ValidationError("Specialization is required for advocates")
            if not attrs.get('bar_council_id'):
                raise serializers.ValidationError("Bar Council ID is required for advocates")
        
        if role == 'police':
            if not attrs.get('badge_number'):
                raise serializers.ValidationError("Badge number is required for police officers")
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Set approval status to pending for advocates
        role = validated_data.get('role')
        if role == 'advocate':
            validated_data['approval_status'] = 'pending'
            validated_data['is_active'] = False
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user details to response
        user = self.user
        data['user'] = {
            'id': str(user.id),
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'phone': user.phone,
            'specialization': user.specialization,
            'experience_years': user.experience_years,
            'rating': str(user.rating),
            'cases_handled': user.cases_handled,
        }
        return data


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'name', 'phone', 'specialization', 'experience_years',
            'address', 'city', 'state', 'pincode', 'bio', 'consultation_fee'
        ]
    
    address = serializers.CharField(required=False, allow_blank=True, source='profile.address')
    city = serializers.CharField(required=False, allow_blank=True, source='profile.city')
    state = serializers.CharField(required=False, allow_blank=True, source='profile.state')
    pincode = serializers.CharField(required=False, allow_blank=True, source='profile.pincode')
    bio = serializers.CharField(required=False, allow_blank=True, source='profile.bio')
    consultation_fee = serializers.DecimalField(required=False, max_digits=10, decimal_places=2, source='profile.consultation_fee')
    
    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        
        # Update user fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update profile fields
        from .models import UserProfile
        profile, created = UserProfile.objects.get_or_create(user=instance)
        for attr, value in profile_data.items():
            setattr(profile, attr, value)
        profile.save()
        
        return instance


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value
