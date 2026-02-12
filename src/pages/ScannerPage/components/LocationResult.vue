<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import type { ArticleItemLocation } from 'src/models/InventoryLocation';
import type { ScanBarcodeResult } from 'src/models/Scan';

interface Props {
    result: Extract<ScanBarcodeResult, { type: 'location' }>;
}

defineProps<Props>();

const itemColumns: QTableColumn[] = [
    { name: 'articleNumber', label: '품목', field: 'articleNumber', align: 'left' },
    { name: 'quantity', label: '수량', field: 'quantity', align: 'center' },
    { name: 'allocatedQuantity', label: '할당', field: 'allocatedQuantity', align: 'center' },
    { name: 'available', label: '가용', field: (row: ArticleItemLocation) => row.quantity - row.allocatedQuantity, align: 'center' },
];
</script>

<template>
    <q-card flat bordered class="q-mb-lg">
        <q-card-section class="bg-teal text-white">
            <div class="row items-center">
                <q-icon name="place" size="md" class="q-mr-md" />
                <div>
                    <div class="text-h6">{{ result.data.locationName }}</div>
                    <div class="text-subtitle2">로케이션 ID: {{ result.data.locationId }}</div>
                </div>
            </div>
        </q-card-section>
        <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">이 로케이션 품목</div>
            <q-table flat bordered dense :rows="result.items" :columns="itemColumns" row-key="articleNumber"
                hide-pagination :rows-per-page-options="[0]" />
            <div v-if="result.items.length === 0" class="text-grey q-pa-md text-center">
                이 로케이션에 품목 없음
            </div>
        </q-card-section>
    </q-card>
</template>
