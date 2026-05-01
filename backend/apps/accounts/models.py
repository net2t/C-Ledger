from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class AuditedModel(TimeStampedModel):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_%(class)s_set',
    )
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='updated_%(class)s_set',
    )

    class Meta:
        abstract = True


class Company(AuditedModel):
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, blank=True)

    def __str__(self) -> str:
        return self.name


class UserRole(models.TextChoices):
    ADMIN = 'ADMIN', 'Admin'
    STAFF = 'STAFF', 'Staff'


class User(AbstractUser, AuditedModel):
    company = models.ForeignKey(
        Company,
        on_delete=models.PROTECT,
        related_name='users',
        null=True,
        blank=True,
    )
    role = models.CharField(max_length=16, choices=UserRole.choices, default=UserRole.STAFF)

    def __str__(self) -> str:
        return self.username


class ActivityAction(models.TextChoices):
    CREATE = 'CREATE', 'Create'
    UPDATE = 'UPDATE', 'Update'
    SOFT_DELETE = 'SOFT_DELETE', 'Soft Delete'
    IMPORT = 'IMPORT', 'Import'
    EXPORT = 'EXPORT', 'Export'
    LOGIN = 'LOGIN', 'Login'


class ActivityLog(AuditedModel):
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='activity_logs')
    action = models.CharField(max_length=32, choices=ActivityAction.choices)
    model_name = models.CharField(max_length=64)
    object_id = models.CharField(max_length=64)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='activity_logs',
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['company', 'timestamp']),
            models.Index(fields=['company', 'model_name', 'timestamp']),
        ]

    def __str__(self) -> str:
        return f'{self.company_id}:{self.action}:{self.model_name}:{self.object_id}'
