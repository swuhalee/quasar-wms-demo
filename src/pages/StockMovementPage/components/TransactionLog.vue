<script setup lang="ts">
import { type QTableColumn } from 'quasar';
import { useAdjustments, useMovements } from 'src/composables/useMovementQuery';
import { useLocations } from 'src/composables/useWarehouseQuery';
import { ref } from 'vue';

const { movements } = useMovements();
const { adjustments } = useAdjustments();
const { locations } = useLocations();

const logTab = ref('movements');

function locationName(id: number): string {
    return locations.value.find((l) => l.locationId === id)?.locationName ?? `LOC-${id}`;
}

const movementColumns: QTableColumn[] = [
    { name: 'movementId', label: 'ID', field: 'movementId', align: 'left', sortable: true },
    { name: 'articleNumber', label: '품목', field: 'articleNumber', align: 'left', sortable: true },
    {
        name: 'from',
        label: '출발',
        field: (row) => locationName(row.fromLocationId),
        align: 'left',
    },
    {
        name: 'to',
        label: '도착',
        field: (row) => locationName(row.toLocationId),
        align: 'left',
    },
    { name: 'quantity', label: '수량', field: 'quantity', align: 'center', sortable: true },
    { name: 'movedDate', label: '일시', field: 'movedDate', align: 'left', sortable: true },
];

const adjustmentColumns: QTableColumn[] = [
    { name: 'adjustmentId', label: 'ID', field: 'adjustmentId', align: 'left', sortable: true },
    { name: 'articleNumber', label: '품목', field: 'articleNumber', align: 'left', sortable: true },
    {
        name: 'location',
        label: '로케이션',
        field: (row) => locationName(row.locationId),
        align: 'left',
    },
    { name: 'adjustedQuantity', label: '조정량', field: 'adjustedQuantity', align: 'center', sortable: true },
    { name: 'reason', label: '사유', field: 'reason', align: 'left' },
    { name: 'adjustedDate', label: '일시', field: 'adjustedDate', align: 'left', sortable: true },
];
</script>

<template>
    <div>
        <div class="text-h5 q-mb-sm">이력</div>
        <q-tabs v-model="logTab" dense align="left" class="text-grey" active-color="primary">
            <q-tab name="movements" label="이동" />
            <q-tab name="adjustments" label="조정" />
        </q-tabs>
        <q-separator />
        <q-tab-panels v-model="logTab">
            <q-tab-panel name="movements" class="q-pa-none">
                <q-table flat bordered :rows="movements" :columns="movementColumns" row-key="movementId"
                    :rows-per-page-options="[10, 25]"
                    :pagination="{ sortBy: 'movedDate', descending: true, rowsPerPage: 10 }" />
            </q-tab-panel>
            <q-tab-panel name="adjustments" class="q-pa-none">
                <q-table flat bordered :rows="adjustments" :columns="adjustmentColumns" row-key="adjustmentId"
                    :rows-per-page-options="[10, 25]"
                    :pagination="{ sortBy: 'adjustedDate', descending: true, rowsPerPage: 10 }" />
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>
