from django.contrib import admin
from .models import Internship, InternshipApplication


@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ['title', 'advocate', 'practice_area', 'status', 'openings', 'created_at']
    list_filter = ['status', 'practice_area']
    search_fields = ['title', 'advocate__email', 'advocate__name']


@admin.register(InternshipApplication)
class InternshipApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'internship', 'status', 'applied_at', 'offer_sent_at']
    list_filter = ['status']
    search_fields = ['student__email', 'student__name', 'internship__title']
    readonly_fields = ['id', 'applied_at', 'updated_at']
