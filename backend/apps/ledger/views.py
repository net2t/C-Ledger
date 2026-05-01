import json

from django.db import models, transaction
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import ActivityAction, ActivityLog
from apps.ledger.models import Client, ImportEntityType, ImportJob, ImportJobStatus, ImportLog, ImportLogStatus, LedgerEntry
from apps.ledger.permissions import IsAdminRole, StaffCreateAdminWrite, StaffOrAdminWrite
from apps.ledger.serializers import (
    ClientSerializer,
    ImportJobSerializer,
    ImportLogSerializer,
    LedgerEntrySerializer,
)


def _get_client_ip(request):
    xff = request.META.get('HTTP_X_FORWARDED_FOR')
    if xff:
        return xff.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


class CompanyScopedViewSet(viewsets.ModelViewSet):
    def get_company(self):
        company = getattr(self.request.user, 'company', None)
        if company is None:
            raise PermissionDenied('User has no company assigned.')
        return company

    def log_activity(self, *, action: str, instance):
        user = self.request.user
        company = self.get_company()
        ActivityLog.objects.create(
            company=company,
            action=action,
            model_name=instance.__class__.__name__,
            object_id=str(instance.pk),
            user=user,
            ip_address=_get_client_ip(self.request),
            user_agent=self.request.META.get('HTTP_USER_AGENT', ''),
            created_by=user,
            updated_by=user,
            metadata={},
        )


class ClientViewSet(CompanyScopedViewSet):
    serializer_class = ClientSerializer
    permission_classes = [StaffCreateAdminWrite]
    search_fields = ['code', 'name', 'city']
    ordering_fields = ['code', 'name', 'city', 'created_at', 'updated_at']
    ordering = ['code']

    def get_queryset(self):
        return Client.objects.filter(company=self.get_company())

    def perform_create(self, serializer):
        user = self.request.user
        company = self.get_company()
        instance = serializer.save(company=company, created_by=user, updated_by=user)
        self.log_activity(action=ActivityAction.CREATE, instance=instance)

    def perform_update(self, serializer):
        user = self.request.user
        instance = serializer.save(updated_by=user)
        self.log_activity(action=ActivityAction.UPDATE, instance=instance)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Only Admin can delete clients.')
        instance = self.get_object()
        instance.soft_delete(deleted_by=request.user)
        self.log_activity(action=ActivityAction.SOFT_DELETE, instance=instance)
        return Response(status=204)


class LedgerEntryViewSet(CompanyScopedViewSet):
    serializer_class = LedgerEntrySerializer
    permission_classes = [StaffOrAdminWrite]
    search_fields = ['details', 'folder_no', 'tm_no', 'stage']
    ordering_fields = ['date', 'created_at', 'updated_at']
    ordering = ['date', 'created_at']

    def get_queryset(self):
        qs = LedgerEntry.objects.filter(company=self.get_company()).select_related('client')
        client_id = self.request.query_params.get('client')
        if client_id:
            qs = qs.filter(client_id=client_id)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        company = self.get_company()
        client = serializer.validated_data['client']
        if client.company_id != company.id:
            raise PermissionDenied('Client is not in your company.')

        with transaction.atomic():
            entry = serializer.save(company=company, created_by=user, updated_by=user)
            client.recalculate_balance()
            client.updated_by = user
            client.save(update_fields=['balance_cached', 'last_recalculated_at', 'updated_by', 'updated_at'])
            entry.balance_snapshot = client.balance_cached
            entry.save(update_fields=['balance_snapshot', 'updated_at'])
        self.log_activity(action=ActivityAction.CREATE, instance=entry)

    def perform_update(self, serializer):
        if getattr(self.request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Only Admin can edit ledger entries.')
        user = self.request.user

        with transaction.atomic():
            entry = serializer.save(updated_by=user)
            entry.client.recalculate_balance()
            entry.client.updated_by = user
            entry.client.save(update_fields=['balance_cached', 'last_recalculated_at', 'updated_by', 'updated_at'])
            entry.balance_snapshot = entry.client.balance_cached
            entry.save(update_fields=['balance_snapshot', 'updated_at'])
        self.log_activity(action=ActivityAction.UPDATE, instance=entry)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Only Admin can delete ledger entries.')
        entry = self.get_object()
        with transaction.atomic():
            LedgerEntry.all_objects.filter(pk=entry.pk).soft_delete(updated_by=request.user, deleted_at=timezone.now())
            entry.client.recalculate_balance()
            entry.client.updated_by = request.user
            entry.client.save(update_fields=['balance_cached', 'last_recalculated_at', 'updated_by', 'updated_at'])
        self.log_activity(action=ActivityAction.SOFT_DELETE, instance=entry)
        return Response(status=204)


class ImportJobViewSet(CompanyScopedViewSet):
    serializer_class = ImportJobSerializer
    permission_classes = [IsAdminRole]
    ordering = ['-created_at']
    ordering_fields = ['created_at', 'status', 'file_name']

    def get_queryset(self):
        return ImportJob.objects.filter(company=self.get_company())

    @action(detail=True, methods=['get'])
    def logs(self, request, pk=None):
        job = self.get_object()
        qs = job.logs.all().order_by('row_number')
        page = self.paginate_queryset(qs)
        serializer = ImportLogSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class BackupExportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Only Admin can export backups.')
        company = getattr(request.user, 'company', None)
        if not company:
            raise PermissionDenied('User has no company assigned.')

        clients = Client.objects.filter(company=company)
        entries = LedgerEntry.objects.filter(company=company)

        data = {
            'clients': ClientSerializer(clients, many=True).data,
            'ledger_entries': LedgerEntrySerializer(entries, many=True).data,
            'exported_at': timezone.now().isoformat(),
        }

        ActivityLog.objects.create(
            company=company,
            action=ActivityAction.EXPORT,
            model_name='Backup',
            object_id='company:' + str(company.pk),
            user=request.user,
            ip_address=_get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            created_by=request.user,
            updated_by=request.user,
        )

        return Response(data)


class BackupImportView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if getattr(request.user, 'role', None) != 'ADMIN':
            raise PermissionDenied('Only Admin can import backups.')
        company = getattr(request.user, 'company', None)
        if not company:
            raise PermissionDenied('User has no company assigned.')

        dry_run = str(request.query_params.get('dry_run', 'false')).lower() == 'true'
        payload = request.data

        payload_bytes = json.dumps(payload, sort_keys=True).encode('utf-8')
        import_hash = ImportJob.compute_hash(payload_bytes)

        existing = ImportJob.objects.filter(company=company, import_hash=import_hash).first()
        if existing:
            return Response(ImportJobSerializer(existing).data)

        job = ImportJob.objects.create(
            company=company,
            file_name=request.query_params.get('file_name', 'import.json'),
            import_hash=import_hash,
            status=ImportJobStatus.DRY_RUN if dry_run else ImportJobStatus.PENDING,
            dry_run=dry_run,
            started_at=timezone.now(),
            created_by=request.user,
            updated_by=request.user,
        )

        def entry_fingerprint(e, client_id):
            parts = [
                str(client_id),
                str(e.get('date') or ''),
                str(e.get('folder_no') or ''),
                str(e.get('stage') or ''),
                str(e.get('tm_no') or ''),
                str(e.get('class_no') or ''),
                str(e.get('due_amount') or 0),
                str(e.get('received_amount') or 0),
                str(e.get('entry_type') or ''),
            ]
            return '|'.join(parts)

        clients_in = payload.get('clients', []) or []
        entries_in = payload.get('ledger_entries', []) or payload.get('entries', []) or []

        client_map = {}
        logs_to_create = []
        now = timezone.now()

        try:
            ctx = transaction.atomic() if not dry_run else transaction.atomic()
            with ctx:
                for i, c in enumerate(clients_in, start=1):
                    code = (c.get('code') or '').strip().upper()
                    dedupe_key = code
                    if not code:
                        logs_to_create.append(
                            ImportLog(
                                job=job,
                                row_number=i,
                                entity_type=ImportEntityType.CLIENT,
                                status=ImportLogStatus.ERROR,
                                message='Missing client code',
                                raw_payload=c,
                            )
                        )
                        continue

                    existing_client = Client.all_objects.filter(company=company, code=code).first()
                    if existing_client and not dry_run:
                        existing_client.name = c.get('name') or existing_client.name
                        existing_client.city = c.get('city') or ''
                        existing_client.notes = c.get('notes') or ''
                        existing_client.updated_by = request.user
                        existing_client.save(update_fields=['name', 'city', 'notes', 'updated_by', 'updated_at'])
                        client_map[code] = existing_client
                        logs_to_create.append(
                            ImportLog(
                                job=job,
                                row_number=i,
                                entity_type=ImportEntityType.CLIENT,
                                dedupe_key=dedupe_key,
                                status=ImportLogStatus.DUPLICATE,
                                message='Client exists (updated)',
                                raw_payload=c,
                            )
                        )
                        continue
                    if existing_client and dry_run:
                        client_map[code] = existing_client
                        logs_to_create.append(
                            ImportLog(
                                job=job,
                                row_number=i,
                                entity_type=ImportEntityType.CLIENT,
                                dedupe_key=dedupe_key,
                                status=ImportLogStatus.DUPLICATE,
                                message='Client exists (dry-run)',
                                raw_payload=c,
                            )
                        )
                        continue

                    if not dry_run:
                        new_client = Client.objects.create(
                            company=company,
                            code=code,
                            name=c.get('name') or code,
                            city=c.get('city') or '',
                            notes=c.get('notes') or '',
                            created_by=request.user,
                            updated_by=request.user,
                        )
                        client_map[code] = new_client
                    logs_to_create.append(
                        ImportLog(
                            job=job,
                            row_number=i,
                            entity_type=ImportEntityType.CLIENT,
                            dedupe_key=dedupe_key,
                            status=ImportLogStatus.SUCCESS,
                            message='Client imported' if not dry_run else 'Client validated',
                            raw_payload=c,
                        )
                    )

                entry_seen = set()
                for j, e in enumerate(entries_in, start=1):
                    code = (e.get('client_code') or '').strip().upper()
                    if not code:
                        logs_to_create.append(
                            ImportLog(
                                job=job,
                                row_number=j,
                                entity_type=ImportEntityType.LEDGER_ENTRY,
                                status=ImportLogStatus.ERROR,
                                message='Missing client_code for entry',
                                raw_payload=e,
                            )
                        )
                        continue

                    client = client_map.get(code) or Client.all_objects.filter(company=company, code=code).first()
                    if not client:
                        logs_to_create.append(
                            ImportLog(
                                job=job,
                                row_number=j,
                                entity_type=ImportEntityType.LEDGER_ENTRY,
                                dedupe_key=code,
                                status=ImportLogStatus.ERROR,
                                message='Client not found for entry',
                                raw_payload=e,
                            )
                        )
                        continue

                    fp = entry_fingerprint(e, client.id)
                    if fp in entry_seen:
                        logs_to_create.append(
                            ImportLog(
                                job=job,
                                row_number=j,
                                entity_type=ImportEntityType.LEDGER_ENTRY,
                                dedupe_key=fp,
                                status=ImportLogStatus.DUPLICATE,
                                message='Duplicate in file',
                                raw_payload=e,
                            )
                        )
                        continue
                    entry_seen.add(fp)

                    exists = LedgerEntry.all_objects.filter(
                        company=company,
                        client=client,
                        date=e.get('date'),
                        folder_no=e.get('folder_no', ''),
                        stage=e.get('stage', ''),
                        tm_no=e.get('tm_no', ''),
                        class_no=e.get('class_no', ''),
                        due_amount=e.get('due_amount', 0) or 0,
                        received_amount=e.get('received_amount', 0) or 0,
                        entry_type=e.get('entry_type', ''),
                    ).exists()
                    if exists:
                        logs_to_create.append(
                            ImportLog(
                                job=job,
                                row_number=j,
                                entity_type=ImportEntityType.LEDGER_ENTRY,
                                dedupe_key=fp,
                                status=ImportLogStatus.DUPLICATE,
                                message='Entry exists',
                                raw_payload=e,
                            )
                        )
                        continue

                    if not dry_run:
                        LedgerEntry.objects.create(
                            company=company,
                            client=client,
                            date=e.get('date'),
                            folder_no=e.get('folder_no', ''),
                            stage=e.get('stage', ''),
                            tm_no=e.get('tm_no', ''),
                            class_no=e.get('class_no', ''),
                            details=e.get('details', ''),
                            due_amount=e.get('due_amount', 0) or 0,
                            received_amount=e.get('received_amount', 0) or 0,
                            entry_type=e.get('entry_type', ''),
                            created_by=request.user,
                            updated_by=request.user,
                        )

                    logs_to_create.append(
                        ImportLog(
                            job=job,
                            row_number=j,
                            entity_type=ImportEntityType.LEDGER_ENTRY,
                            dedupe_key=fp,
                            status=ImportLogStatus.SUCCESS,
                            message='Entry imported' if not dry_run else 'Entry validated',
                            raw_payload=e,
                        )
                    )

                if not dry_run:
                    for c in Client.objects.filter(company=company):
                        c.recalculate_balance()
                        c.updated_by = request.user
                        c.save(update_fields=['balance_cached', 'last_recalculated_at', 'updated_by', 'updated_at'])

                ImportLog.objects.bulk_create(logs_to_create)

                job.status = ImportJobStatus.DRY_RUN if dry_run else ImportJobStatus.SUCCESS
                job.finished_at = timezone.now()
                job.updated_by = request.user
                job.save(update_fields=['status', 'finished_at', 'updated_by', 'updated_at'])

                ActivityLog.objects.create(
                    company=company,
                    action=ActivityAction.IMPORT,
                    model_name='ImportJob',
                    object_id=str(job.pk),
                    user=request.user,
                    ip_address=_get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    created_by=request.user,
                    updated_by=request.user,
                    metadata={'dry_run': dry_run},
                )

                if dry_run:
                    raise transaction.TransactionManagementError('Dry-run rollback')

        except transaction.TransactionManagementError:
            if dry_run:
                ImportLog.objects.bulk_create(logs_to_create)
                job.status = ImportJobStatus.DRY_RUN
                job.finished_at = timezone.now()
                job.updated_by = request.user
                job.save(update_fields=['status', 'finished_at', 'updated_by', 'updated_at'])
        except Exception as exc:
            ImportLog.objects.bulk_create(logs_to_create)
            job.status = ImportJobStatus.FAILED
            job.finished_at = timezone.now()
            job.updated_by = request.user
            job.save(update_fields=['status', 'finished_at', 'updated_by', 'updated_at'])
            raise

        return Response(ImportJobSerializer(job).data)


class DashboardAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        company = getattr(request.user, 'company', None)
        if not company:
            raise PermissionDenied('User has no company assigned.')

        totals = LedgerEntry.objects.filter(company=company).aggregate(
            total_due=models.Sum('due_amount'),
            total_received=models.Sum('received_amount'),
        )
        total_due = totals.get('total_due') or 0
        total_received = totals.get('total_received') or 0
        return Response(
            {
                'total_clients': Client.objects.filter(company=company).count(),
                'total_due': total_due,
                'total_received': total_received,
                'total_outstanding': total_due - total_received,
            }
        )
