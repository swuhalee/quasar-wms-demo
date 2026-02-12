<script setup lang="ts">
import type { AuditLogEntry } from 'src/models/AuditLog';

defineProps<{
    logs: AuditLogEntry[];
    actionLabel: (action: string) => string;
    actionIcon: (action: string) => string;
    actionColor: (action: string) => string;
}>();
</script>

<template>
    <q-card flat bordered shadow-2>
        <q-card-section>
            <q-timeline v-if="logs.length > 0" color="primary">
                <q-timeline-entry v-for="entry in logs" :key="entry.auditId" :title="actionLabel(entry.action)"
                    :subtitle="new Date(entry.timestamp).toLocaleString()" :icon="actionIcon(entry.action)"
                    :color="actionColor(entry.action)">
                    <div>{{ entry.description }}</div>
                    <div v-if="entry.articleNumber" class="text-caption text-grey q-mt-xs">
                        품목: {{ entry.articleNumber }} | {{ entry.referenceType }} #{{ entry.referenceId }}
                    </div>
                </q-timeline-entry>
            </q-timeline>
            <div v-else class="text-grey text-center q-pa-lg">
                조건에 맞는 작업 이력이 없습니다
            </div>
        </q-card-section>
    </q-card>
</template>
