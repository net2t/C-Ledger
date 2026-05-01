from django.contrib import admin

from apps.ledger.models import Client, ImportJob, ImportLog, LedgerEntry


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'code', 'name', 'city', 'balance_cached', 'is_deleted', 'created_at')
    list_filter = ('company', 'is_deleted', 'city')
    search_fields = ('code', 'name', 'city')


@admin.register(LedgerEntry)
class LedgerEntryAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'client', 'date', 'entry_type', 'due_amount', 'received_amount', 'is_deleted')
    list_filter = ('company', 'entry_type', 'is_deleted', 'stage')
    search_fields = ('details', 'folder_no', 'tm_no')
    date_hierarchy = 'date'


@admin.register(ImportJob)
class ImportJobAdmin(admin.ModelAdmin):
    list_display = ('id', 'company', 'file_name', 'import_hash', 'status', 'dry_run', 'created_at')
    list_filter = ('company', 'status', 'dry_run')
    search_fields = ('file_name', 'import_hash')


@admin.register(ImportLog)
class ImportLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'job', 'row_number', 'entity_type', 'status')
    list_filter = ('status', 'entity_type')
    search_fields = ('dedupe_key', 'message')
