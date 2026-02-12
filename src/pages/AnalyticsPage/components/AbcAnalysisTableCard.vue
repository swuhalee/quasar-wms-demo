<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import { useAbcAnalysis } from 'src/composables/useAnalyticsQuery';
import type { AbcCategory } from 'src/models/Analytics';

const { analysis } = useAbcAnalysis();

function categoryColor(cat: AbcCategory) {
    return cat === 'A' ? 'positive' : cat === 'B' ? 'warning' : 'negative';
}

const columns: QTableColumn[] = [
    { name: 'articleNumber', label: 'SKU', field: 'articleNumber', align: 'left', sortable: true },
    { name: 'articleName', label: '품목명', field: 'articleName', align: 'left' },
    { name: 'orderLineQuantity', label: '주문 수량', field: 'orderLineQuantity', align: 'center', sortable: true },
    { name: 'totalMovementQuantity', label: '이동 수량', field: 'totalMovementQuantity', align: 'center', sortable: true },
    { name: 'category', label: '구분', field: 'category', align: 'center', sortable: true },
];
</script>

<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6">ABC 분석 상세</div>
            <div class="text-caption text-grey-7 q-mb-md">각 품목의 주문 수량, 이동 수량과 ABC 등급을 확인할 수 있습니다.</div>
            <q-table flat bordered :rows="analysis" :columns="columns" row-key="articleNumber" hide-pagination
                :rows-per-page-options="[0]">
                <template v-slot:body-cell-category="props">
                    <q-td :props="props">
                        <q-badge :color="categoryColor(props.row.category)" :label="props.row.category" />
                    </q-td>
                </template>
            </q-table>
        </q-card-section>
    </q-card>
</template>
