<script setup lang="ts">
import { computed } from 'vue';
import type { AbcAnalysisItem } from 'src/models/Analytics';

const { analysis } = defineProps<{
    analysis: AbcAnalysisItem[];
}>();

const chartOptions = computed(() => ({
    chart: { toolbar: { show: false } },
    xaxis: { categories: analysis.map((a) => a.articleNumber) },
    colors: analysis.map((a) =>
        a.category === 'A' ? '#21ba45' : a.category === 'B' ? '#f2c037' : '#c10015',
    ),
    plotOptions: { bar: { distributed: true, borderRadius: 4 } },
    legend: { show: false },
}));

const chartSeries = computed(() => [
    { name: '주문 수량', data: analysis.map((a) => a.orderLineQuantity) },
]);
</script>

<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6">ABC 분석 — 주문 수요</div>
            <div class="text-caption text-grey-7 q-mb-sm">품목별 주문량을 기준으로 A(상위), B(중위), C(하위)로 분류합니다.</div>
            <apexchart v-if="analysis.length > 0" type="bar" :options="chartOptions" :series="chartSeries"
                height="300" />
        </q-card-section>
    </q-card>
</template>
