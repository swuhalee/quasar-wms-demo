<script setup lang="ts">
import { useReturnCauseSummary } from 'src/composables/useReturnOrderQuery';
import { computed } from 'vue';

const { causeSummary } = useReturnCauseSummary();

const series = computed(() => causeSummary.value.map((c) => c.count));
const options = computed(() => ({
    labels: causeSummary.value.map((c) => c.causeLabel),
    colors: ['#c10015', '#f2c037', '#9c27b0', '#1976d2', '#26a69a', '#757575'],
    legend: { position: 'bottom' as const },
}));
</script>

<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-h6 q-mb-md">반품 사유</div>
            <div v-if="causeSummary.length > 0" class="row justify-center">
                <div style="max-width: 500px; width: 100%">
                    <apexchart type="donut" :options="options" :series="series" height="320" />
                </div>
            </div>
            <div v-else class="text-grey text-center q-pa-lg">
                표시할 반품 데이터 없음
            </div>
        </q-card-section>
    </q-card>
</template>
