<script setup lang="ts">
import { type QTableColumn } from 'quasar';
import type { Article } from 'src/models/Article';
import { ref } from 'vue';

defineProps<{ articles: Article[], loading: boolean }>();

const filter = ref('');

const columns: QTableColumn[] = [
    { name: 'articleNumber', label: 'SKU', field: 'articleNumber', align: 'left', sortable: true },
    { name: 'articleName', label: '품목명', field: 'articleName', align: 'left', sortable: true },
    { name: 'productCode', label: '제품코드', field: 'productCode', align: 'left' },
    {
        name: 'numberOfItems',
        label: '실재고',
        field: (row) => row.inventoryInfo.numberOfItems,
        align: 'center',
        sortable: true,
    },
    {
        name: 'sellableNumberOfItems',
        label: '판매가능',
        field: (row) => row.inventoryInfo.sellableNumberOfItems,
        align: 'center',
        sortable: true,
    },
    {
        name: 'barCode',
        label: '바코드',
        field: (row) => row.barCodes[0]?.barCode ?? '-',
        align: 'left',
    },
    {
        name: 'audit',
        label: '이력',
        align: 'center',
        field: () => '',
        sortable: false,
    },
];

function rowClass(row: { inventoryInfo: { sellableNumberOfItems: number } }) {
    return row.inventoryInfo.sellableNumberOfItems < 10 ? 'bg-red-1 text-negative' : '';
}
</script>

<template>
    <q-table flat bordered :rows="articles" :columns="columns" row-key="articleSystemId" :loading="loading"
        :filter="filter" :row-class="rowClass">
        <template #top-right>
            <q-input v-model="filter" dense outlined debounce="300" placeholder="품목 검색...">
                <template #append>
                    <q-icon name="search" />
                </template>
            </q-input>
        </template>
        <template #body-cell-audit="props">
            <q-td :props="props">
                <q-btn flat dense round icon="history" color="blue-grey"
                    :to="{ name: 'audit', query: { article: props.row.articleNumber } }">
                    <q-tooltip>SKU 이력 보기</q-tooltip>
                </q-btn>
            </q-td>
        </template>
    </q-table>
</template>
