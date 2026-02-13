<script setup lang="ts">
import { computed } from 'vue';
import { usePerformance, useInventoryTrends, useAbcAnalysis, useLowStockAlerts } from 'src/composables/useAnalyticsQuery';
import KpiCardsRow from './components/KpiCardsRow.vue';
import InventoryTrendCard from './components/InventoryTrendCard.vue';
import AbcAnalysisChartCard from './components/AbcAnalysisChartCard.vue';
import OrderStatusPieCard from './components/OrderStatusPieCard.vue';
import LowStockAlertCard from './components/LowStockAlertCard.vue';
import AbcAnalysisTableCard from './components/AbcAnalysisTableCard.vue';

const { performances, isLoading: perfLoading } = usePerformance();
const { trends, isLoading: trendsLoading } = useInventoryTrends();
const { analysis, isLoading: abcLoading } = useAbcAnalysis();
const { alerts, isLoading: alertsLoading } = useLowStockAlerts();

const loading = computed(() => perfLoading.value || trendsLoading.value || abcLoading.value || alertsLoading.value);
</script>

<template>
    <q-page padding>
        <div class="text-h5 q-mb-lg">고급 분석</div>

        <div v-if="loading" class="text-center q-pa-xl">
            <q-spinner size="48px" color="primary" />
        </div>

        <template v-else>
            <KpiCardsRow :performances="performances" :alerts="alerts" />

            <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-6">
                    <InventoryTrendCard :trends="trends" />
                </div>
                <div class="col-12 col-md-6">
                    <AbcAnalysisChartCard :analysis="analysis" />
                </div>
            </div>

            <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-4">
                    <OrderStatusPieCard />
                </div>
                <div class="col-12 col-md-8">
                    <LowStockAlertCard :alerts="alerts" />
                </div>
            </div>

            <AbcAnalysisTableCard :analysis="analysis" />
        </template>
    </q-page>
</template>
