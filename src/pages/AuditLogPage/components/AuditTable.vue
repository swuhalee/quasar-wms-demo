<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import type { AuditLogEntry } from 'src/models/AuditLog';

defineProps<{
    logs: AuditLogEntry[];
    actionLabel: (action: string) => string;
    actionColor: (action: string) => string;
}>();

const columns: QTableColumn[] = [
    { name: 'auditId', label: 'ID', field: 'auditId', align: 'left', sortable: true },
    { name: 'timestamp', label: '일시', field: 'timestamp', align: 'left', sortable: true, format: (v: string) => new Date(v).toLocaleString() },
    { name: 'action', label: '액션', field: 'action', align: 'left', sortable: true },
    { name: 'articleNumber', label: '품목', field: 'articleNumber', align: 'left', sortable: true },
    { name: 'referenceType', label: '참조 유형', field: 'referenceType', align: 'left' },
    { name: 'referenceId', label: '참조 ID', field: 'referenceId', align: 'left' },
    { name: 'description', label: '설명', field: 'description', align: 'left' },
];
</script>

<template>
    <q-table flat bordered :rows="logs" :columns="columns" row-key="auditId"
        :pagination="{ sortBy: 'timestamp', descending: true, rowsPerPage: 25 }">
        <template v-slot:body-cell-action="props">
            <q-td :props="props">
                <q-badge :color="actionColor(props.row.action)" :label="actionLabel(props.row.action)" />
            </q-td>
        </template>
    </q-table>
</template>
