import hashlib

from django.db import models, transaction
from django.utils import timezone

from apps.accounts.models import AuditedModel, Company, TimeStampedModel


class SoftDeleteQuerySet(models.QuerySet):
    def alive(self):
        return self.filter(is_deleted=False)

    def dead(self):
        return self.filter(is_deleted=True)

    def soft_delete(self, *, deleted_at=None, updated_by=None):
        when = deleted_at or timezone.now()
        update_kwargs = {'is_deleted': True, 'deleted_at': when}
        if updated_by is not None:
            update_kwargs['updated_by'] = updated_by
        return self.update(**update_kwargs)

    def restore(self, *, updated_by=None):
        update_kwargs = {'is_deleted': False, 'deleted_at': None}
        if updated_by is not None:
            update_kwargs['updated_by'] = updated_by
        return self.update(**update_kwargs)


class ActiveManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).alive()


class SoftDeleteModel(AuditedModel):
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True


class Client(SoftDeleteModel):
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='clients', db_index=True)
    code = models.CharField(max_length=32)
    name = models.CharField(max_length=255)
    city = models.CharField(max_length=128, blank=True)
    notes = models.TextField(blank=True)

    balance_cached = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    last_recalculated_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['company', 'code'], name='uniq_client_code_per_company'),
        ]
        indexes = [
            models.Index(fields=['company', 'code']),
        ]

    def __str__(self) -> str:
        return f'{self.code} - {self.name}'

    def recalculate_balance(self):
        total = (
            LedgerEntry.objects.filter(client=self)
            .aggregate(total=models.Sum(models.F('due_amount') - models.F('received_amount')))
            .get('total')
            or 0
        )
        self.balance_cached = total
        self.last_recalculated_at = timezone.now()

    def soft_delete(self, *, deleted_by=None):
        with transaction.atomic():
            now = timezone.now()
            self.is_deleted = True
            self.deleted_at = now
            self.updated_by = deleted_by
            self.save(update_fields=['is_deleted', 'deleted_at', 'updated_by', 'updated_at'])
            LedgerEntry.all_objects.filter(client=self, is_deleted=False).soft_delete(deleted_at=now, updated_by=deleted_by)

    def restore(self, *, restored_by=None, restore_entries=False):
        with transaction.atomic():
            self.is_deleted = False
            self.deleted_at = None
            self.updated_by = restored_by
            self.save(update_fields=['is_deleted', 'deleted_at', 'updated_by', 'updated_at'])
            if restore_entries:
                LedgerEntry.all_objects.filter(client=self, is_deleted=True).restore(updated_by=restored_by)


class LedgerEntryType(models.TextChoices):
    NORMAL = 'NORMAL', 'Normal'
    RECEIVED = 'RECEIVED', 'Received'
    OPENING = 'OPENING', 'Opening'


class LedgerEntry(SoftDeleteModel):
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='ledger_entries', db_index=True)
    client = models.ForeignKey(Client, on_delete=models.PROTECT, related_name='entries', db_index=True)

    date = models.DateField(db_index=True)
    folder_no = models.CharField(max_length=64, blank=True)
    stage = models.CharField(max_length=64, blank=True, db_index=True)
    tm_no = models.CharField(max_length=64, blank=True, db_index=True)
    class_no = models.CharField(max_length=16, blank=True)
    details = models.TextField(blank=True)

    due_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    received_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    entry_type = models.CharField(max_length=16, choices=LedgerEntryType.choices, default=LedgerEntryType.NORMAL)

    balance_snapshot = models.DecimalField(max_digits=14, decimal_places=2, default=0)

    class Meta:
        indexes = [
            models.Index(fields=['company', 'client', 'date']),
            models.Index(fields=['company', 'stage']),
            models.Index(fields=['company', 'tm_no']),
        ]

    def __str__(self) -> str:
        return f'{self.client_id}:{self.date}:{self.entry_type}'


class ImportJobStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending'
    DRY_RUN = 'DRY_RUN', 'Dry Run'
    SUCCESS = 'SUCCESS', 'Success'
    FAILED = 'FAILED', 'Failed'


class ImportJob(AuditedModel):
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name='import_jobs', db_index=True)
    file_name = models.CharField(max_length=255)
    import_hash = models.CharField(max_length=64)
    status = models.CharField(max_length=16, choices=ImportJobStatus.choices, default=ImportJobStatus.PENDING)
    dry_run = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['company', 'import_hash'], name='uniq_import_hash_per_company'),
        ]
        indexes = [
            models.Index(fields=['company', 'created_at']),
        ]

    @staticmethod
    def compute_hash(data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()


class ImportLogStatus(models.TextChoices):
    SUCCESS = 'SUCCESS', 'Success'
    DUPLICATE = 'DUPLICATE', 'Duplicate'
    ERROR = 'ERROR', 'Error'


class ImportEntityType(models.TextChoices):
    CLIENT = 'CLIENT', 'Client'
    LEDGER_ENTRY = 'LEDGER_ENTRY', 'Ledger Entry'


class ImportLog(TimeStampedModel):
    job = models.ForeignKey(ImportJob, on_delete=models.CASCADE, related_name='logs')
    row_number = models.PositiveIntegerField()
    entity_type = models.CharField(max_length=32, choices=ImportEntityType.choices)
    dedupe_key = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=16, choices=ImportLogStatus.choices)
    message = models.TextField(blank=True)
    raw_payload = models.JSONField(default=dict, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['job', 'row_number']),
            models.Index(fields=['job', 'status']),
        ]
