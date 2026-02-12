<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { useEvents } from 'src/composables/useWebhookQuery';
import { type WebhookEventType, WebhookEventTypeLabel } from 'src/models/Webhook';

const { events, isLoading } = useEvents();

function eventTypeLabel(et: string) {
    return WebhookEventTypeLabel[et as WebhookEventType] ?? et;
}

const columns: QTableColumn[] = [
    { name: 'eventId', label: 'ID', field: 'eventId', align: 'left', sortable: true },
    { name: 'eventType', label: '유형', field: 'eventType', align: 'left', sortable: true },
    { name: 'receivedDate', label: '수신일시', field: 'receivedDate', align: 'left', sortable: true, format: (v: string) => new Date(v).toLocaleString() },
    { name: 'processed', label: '처리여부', field: 'processed', align: 'center', sortable: true },
    { name: 'resultMessage', label: '결과', field: 'resultMessage', align: 'left' },
];
</script>

<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">웹훅 이벤트 로그</div>
            <q-table flat bordered :rows="events" :columns="columns" row-key="eventId" :loading="isLoading"
                :pagination="{ sortBy: 'receivedDate', descending: true, rowsPerPage: 10 }">
                <template v-slot:body-cell-processed="props">
                    <q-td :props="props">
                        <q-badge :color="props.row.processed ? 'positive' : 'negative'"
                            :label="props.row.processed ? '예' : '아니오'" />
                    </q-td>
                </template>
                <template v-slot:body-cell-eventType="props">
                    <q-td :props="props">
                        <q-badge color="indigo" :label="eventTypeLabel(props.row.eventType)" />
                    </q-td>
                </template>
            </q-table>
        </q-card-section>
    </q-card>
</template>
