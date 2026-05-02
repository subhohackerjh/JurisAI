from django.contrib import admin
from .models import Case, CaseDocument, Hearing, CaseUpdate, DraftRequest


class CaseDocumentInline(admin.TabularInline):
    model = CaseDocument
    extra = 0
    readonly_fields = ['created_at']


class HearingInline(admin.TabularInline):
    model = Hearing
    extra = 0
    readonly_fields = ['created_at', 'updated_at']


class CaseUpdateInline(admin.TabularInline):
    model = CaseUpdate
    extra = 0
    readonly_fields = ['created_at']


@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ['title', 'cnr_number', 'customer', 'advocate', 'status', 'case_type', 'created_at']
    list_filter = ['status', 'case_type', 'is_active', 'created_at']
    search_fields = ['title', 'cnr_number', 'customer__name', 'customer__email', 'advocate__name']
    date_hierarchy = 'created_at'
    inlines = [CaseDocumentInline, HearingInline, CaseUpdateInline]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'case_type', 'status', 'cnr_number')
        }),
        ('Parties', {
            'fields': ('customer', 'advocate')
        }),
        ('Court Information', {
            'fields': ('court_name', 'court_address', 'judge_name')
        }),
        ('Dates', {
            'fields': ('filing_date', 'next_hearing_date', 'registration_date', 'disposal_date')
        }),
        ('Financial', {
            'fields': ('advocate_fee', 'total_cost')
        }),
        ('Settings', {
            'fields': ('is_active', 'is_public', 'priority')
        }),
    )


@admin.register(CaseDocument)
class CaseDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'case', 'document_type', 'uploaded_by', 'created_at']
    list_filter = ['document_type', 'created_at']
    search_fields = ['title', 'case__title', 'uploaded_by__name']


@admin.register(Hearing)
class HearingAdmin(admin.ModelAdmin):
    list_display = ['case', 'hearing_date', 'hearing_type', 'court_room', 'is_completed']
    list_filter = ['hearing_type', 'is_completed', 'hearing_date']
    search_fields = ['case__title', 'judge_name', 'court_room']
    date_hierarchy = 'hearing_date'


@admin.register(CaseUpdate)
class CaseUpdateAdmin(admin.ModelAdmin):
    list_display = ['case', 'update_type', 'title', 'created_by', 'is_customer_visible', 'created_at']
    list_filter = ['update_type', 'is_customer_visible', 'created_at']
    search_fields = ['title', 'description', 'case__title']


@admin.register(DraftRequest)
class DraftRequestAdmin(admin.ModelAdmin):
    list_display = ['document_type', 'customer', 'advocate', 'status', 'created_at']
    list_filter = ['document_type', 'status', 'created_at']
    search_fields = ['customer__name', 'advocate__name', 'requirements']
    date_hierarchy = 'created_at'
