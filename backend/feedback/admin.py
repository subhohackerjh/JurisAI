from django.contrib import admin
from .models import Feedback, FeedbackResponse, AdvocateRating, SystemRating


class FeedbackResponseInline(admin.TabularInline):
    model = FeedbackResponse
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['subject', 'user', 'feedback_type', 'status', 'priority', 'created_at']
    list_filter = ['feedback_type', 'status', 'priority', 'created_at']
    search_fields = ['subject', 'message', 'user__name', 'user__email']
    date_hierarchy = 'created_at'
    inlines = [FeedbackResponseInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'feedback_type', 'subject', 'message')
        }),
        ('Related', {
            'fields': ('related_case', 'related_draft')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'assigned_to')
        }),
        ('Admin Notes', {
            'fields': ('admin_notes', 'resolution', 'resolved_at'),
            'classes': ('collapse',)
        }),
        ('Contact', {
            'fields': ('contact_email', 'contact_phone'),
            'classes': ('collapse',)
        }),
    )


@admin.register(FeedbackResponse)
class FeedbackResponseAdmin(admin.ModelAdmin):
    list_display = ['feedback', 'responder', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']
    search_fields = ['message', 'feedback__subject', 'responder__name']


@admin.register(AdvocateRating)
class AdvocateRatingAdmin(admin.ModelAdmin):
    list_display = ['advocate', 'customer', 'rating', 'is_verified', 'is_public', 'created_at']
    list_filter = ['rating', 'is_verified', 'is_public', 'created_at']
    search_fields = ['advocate__name', 'customer__name', 'review']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Parties', {
            'fields': ('customer', 'advocate')
        }),
        ('Related', {
            'fields': ('related_case', 'related_draft')
        }),
        ('Rating', {
            'fields': ('rating', 'review')
        }),
        ('Categories', {
            'fields': ('professionalism', 'communication', 'expertise', 'timeliness'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('is_verified', 'is_public')
        }),
    )


@admin.register(SystemRating)
class SystemRatingAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'would_recommend', 'created_at']
    list_filter = ['rating', 'would_recommend', 'created_at']
    search_fields = ['user__name', 'review']
