<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useProcessReturnOrder } from 'src/composables/useReturnOrderQuery';
import type { ReturnOrder } from 'src/models/ReturnOrder';

interface Props {
    processTarget: ReturnOrder | null;
    processForm: {
        rowNumber: number;
        articleNumber: string;
        qty: number;
        causeLabel: string;
        disposition: string;
        inspectionNote: string;
    }[];
}

const props = defineProps<Props>();


defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const { processReturnOrder, isLoading } = useProcessReturnOrder();

async function submitProcess() {
    if (!props.processTarget) return;
    try {
        await processReturnOrder({
            returnOrderId: props.processTarget.returnOrderId,
            payload: {
                lineDispositions: props.processForm.map((l) => ({
                    rowNumber: l.rowNumber,
                    disposition: l.disposition as 'restock' | 'damaged',
                    inspectionNote: l.inspectionNote,
                })),
            },
        });
        $q.notify({ type: 'positive', message: '반품 처리되었습니다.' });
        onDialogOK();
    } catch (err: unknown) {
        $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '실패했습니다.' });
    }
}
</script>

<template>
    <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
        <q-card style="min-width: 550px">
            <q-card-section>
                <div class="text-h6">반품 처리: {{ processTarget?.returnOrderNumber }}</div>
            </q-card-section>
            <q-card-section class="q-gutter-sm">
                <div v-for="line in processForm" :key="line.rowNumber" class="q-mb-md">
                    <div class="text-weight-bold">{{ line.articleNumber }} ({{ line.qty }}건) — {{ line.causeLabel }}
                    </div>
                    <q-option-group v-model="line.disposition"
                        :options="[{ label: '입고', value: 'restock' }, { label: '파손', value: 'damaged' }]" inline />
                    <q-input v-model="line.inspectionNote" label="검수 메모" outlined dense class="q-mt-xs" />
                </div>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="취소" @click="onDialogCancel" />
                <q-btn color="orange" label="처리" :loading="isLoading" @click="submitProcess" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
