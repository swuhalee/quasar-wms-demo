<script setup lang="ts">
import { computed } from 'vue';
import { useOrders } from 'src/composables/useOrderQuery';
import { OrderStatusId } from 'src/models/Order';

const { orders } = useOrders();

const pieSeries = computed(() => {
    const created = orders.value.filter((o) => o.orderStatus.statusId === OrderStatusId.Created).length;
    const picked = orders.value.filter((o) => o.orderStatus.statusId === OrderStatusId.Picked).length;
    const shipped = orders.value.filter((o) => o.orderStatus.statusId === OrderStatusId.Shipped).length;
    return [created, picked, shipped];
});

const pieOptions = computed(() => ({
    labels: ['생성됨', '픽 완료', '출고 완료'],
    colors: ['#1976d2', '#f2c037', '#21ba45'],
    legend: { position: 'bottom' as const },
}));
</script>

<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6">상태별 주문</div>
            <div class="text-caption text-grey-7 q-mb-sm">현재 주문들의 진행 상태 비율입니다.</div>
            <apexchart type="pie" :options="pieOptions" :series="pieSeries" height="280" />
        </q-card-section>
    </q-card>
</template>
