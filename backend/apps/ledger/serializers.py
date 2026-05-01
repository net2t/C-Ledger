from rest_framework import serializers

from apps.ledger.models import Client, ImportJob, ImportLog, LedgerEntry


class ClientSerializer(serializers.ModelSerializer):
    balance_cached = serializers.DecimalField(max_digits=14, decimal_places=2, read_only=True)

    class Meta:
        model = Client
        fields = [
            'id',
            'code',
            'name',
            'city',
            'notes',
            'balance_cached',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'balance_cached']


class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = [
            'id',
            'client',
            'date',
            'folder_no',
            'stage',
            'tm_no',
            'class_no',
            'details',
            'due_amount',
            'received_amount',
            'entry_type',
            'balance_snapshot',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'balance_snapshot']

    def validate(self, attrs):
        due = attrs.get('due_amount', 0) or 0
        received = attrs.get('received_amount', 0) or 0
        if due < 0 or received < 0:
            raise serializers.ValidationError('Amounts cannot be negative.')
        if due == 0 and received == 0:
            raise serializers.ValidationError('Either due_amount or received_amount must be > 0.')
        return attrs


class ImportJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportJob
        fields = [
            'id',
            'file_name',
            'import_hash',
            'status',
            'dry_run',
            'started_at',
            'finished_at',
            'created_at',
            'updated_at',
        ]


class ImportLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImportLog
        fields = [
            'id',
            'row_number',
            'entity_type',
            'dedupe_key',
            'status',
            'message',
            'raw_payload',
            'created_at',
            'updated_at',
        ]
