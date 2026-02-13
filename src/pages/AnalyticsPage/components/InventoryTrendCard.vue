<script setup lang="ts">
import { computed } from 'vue';
import type { InventoryTrends } from 'src/models/Analytics';

const { trends } = defineProps<{
    trends: InventoryTrends;
}>();

const chartOptions = computed(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: trends.dates },
    stroke: { curve: 'smooth' as const },
    colors: ['#1976d2', '#26a69a'],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0.1 } },
}));

const chartSeries = computed(() => [
    { name: '총 재고', data: trends.totalInventory },
    { name: '판매 가능', data: trends.sellableInventory },
]);
</script>

<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6">재고 추이 (7일)</div>
            <div class="text-caption text-grey-7 q-mb-sm">최근 7일간 총 재고와 판매 가능 수량의 변화를 보여줍니다.</div>
            <apexchart v-if="trends.dates.length > 0" type="area" :options="chartOptions" :series="chartSeries" height="300" />
        </q-card-section>
    </q-card>
</template>
