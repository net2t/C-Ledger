from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from apps.accounts.models import ActivityLog, Company, User


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug', 'created_at', 'updated_at')
    search_fields = ('name', 'slug')


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'role', 'company', 'is_staff', 'is_active')
    list_filter = ('role', 'company', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Company', {'fields': ('company', 'role')}),
        ('Audit', {'fields': ('created_by', 'updated_by')}),
    )


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'company', 'action', 'model_name', 'object_id', 'user', 'ip_address')
    list_filter = ('company', 'action', 'model_name')
    search_fields = ('object_id', 'user__username', 'ip_address', 'user_agent')
