<script setup lang="ts">
import { computed } from 'vue';
import { usePerformance, useInventoryTrends, useAbcAnalysis, useLowStockAlerts } from 'src/composables/useAnalyticsQuery';
import KpiCardsRow from './components/KpiCardsRow.vue';
import InventoryTrendCard from './components/InventoryTrendCard.vue';
import AbcAnalysisChartCard from './components/AbcAnalysisChartCard.vue';
import OrderStatusPieCard from './components/OrderStatusPieCard.vue';
import LowStockAlertCard from './components/LowStockAlertCard.vue';
import AbcAnalysisTableCard from './components/AbcAnalysisTableCard.vue';

const { isLoading: perfLoading } = usePerformance();
const { isLoading: trendsLoading } = useInventoryTrends();
const { isLoading: abcLoading } = useAbcAnalysis();
const { isLoading: alertsLoading } = useLowStockAlerts();

const loading = computed(() => perfLoading.value || trendsLoading.value || abcLoading.value || alertsLoading.value);
</script>

<template>
    <q-page padding>
        <div class="text-h5 q-mb-lg">고급 분석</div>

        <div v-if="loading" class="text-center q-pa-xl">
            <q-spinner size="48px" color="primary" />
        </div>

        <template v-else>
            <KpiCardsRow />

            <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-6">
                    <InventoryTrendCard />
                </div>
                <div class="col-12 col-md-6">
                    <AbcAnalysisChartCard />
                </div>
            </div>

            <div class="row q-col-gutter-md q-mb-lg">
                <div class="col-12 col-md-4">
                    <OrderStatusPieCard />
                </div>
                <div class="col-12 col-md-8">
                    <LowStockAlertCard />
                </div>
            </div>

            <AbcAnalysisTableCard />
        </template>
    </q-page>
</template>
