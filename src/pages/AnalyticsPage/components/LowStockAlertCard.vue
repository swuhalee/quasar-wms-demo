<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import type { LowStockAlert } from 'src/models/Analytics';

const { alerts } = defineProps<{
    alerts: LowStockAlert[];
}>();

const columns: QTableColumn[] = [
    { name: 'articleNumber', label: 'SKU', field: 'articleNumber', align: 'left' },
    { name: 'articleName', label: '품목명', field: 'articleName', align: 'left' },
    { name: 'currentSellable', label: '판매가능', field: 'currentSellable', align: 'center' },
    { name: 'reorderPoint', label: '재주문점', field: 'reorderPoint', align: 'center' },
    { name: 'deficit', label: '부족량', field: 'deficit', align: 'center' },
];
</script>

<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6">재고 부족 알림</div>
            <div class="text-caption text-grey-7 q-mb-sm">판매 가능 수량이 재주문점 아래로 떨어진 품목입니다.</div>
            <q-table flat bordered dense :rows="alerts" :columns="columns" row-key="articleNumber" hide-pagination
                :rows-per-page-options="[0]">
                <template v-slot:body-cell-deficit="props">
                    <q-td :props="props">
                        <q-badge :color="props.row.deficit > props.row.reorderPoint * 0.5 ? 'negative' : 'warning'"
                            :label="`-${props.row.deficit}`" />
                    </q-td>
                </template>
            </q-table>
            <div v-if="alerts.length === 0" class="text-positive q-pa-md">
                <q-icon name="check_circle" size="sm" class="q-mr-sm" />모든 품목이 재주문점 이상입니다
            </div>
        </q-card-section>
    </q-card>
</template>
