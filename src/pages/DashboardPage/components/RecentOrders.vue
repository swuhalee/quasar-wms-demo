<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import type { Order } from 'src/models/Order';

defineProps<{ orders: Order[] }>();

const orderColumns: QTableColumn[] = [
    { name: 'orderNumber', label: '주문번호', field: 'orderNumber', align: 'left', sortable: true },
    {
        name: 'status',
        label: '상태',
        field: (row) => row.orderStatus.statusText,
        align: 'left',
        sortable: true,
    },
    {
        name: 'lines',
        label: '라인 수',
        field: (row) => row.orderLines.length,
        align: 'center',
    },
    { name: 'createdDate', label: '생성일', field: 'createdDate', align: 'left', sortable: true },
];
</script>

<template>
    <div class="q-mt-lg">
        <div class="text-h5 q-mb-sm">최근 주문</div>
        <q-table flat bordered :rows="orders" :columns="orderColumns" row-key="orderId" :rows-per-page-options="[5]"
            hide-pagination />
    </div>
</template>
