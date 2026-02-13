<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardSummary } from 'src/composables/useDashboardQuery';
import KPICards from './components/KPICards.vue';
import QuickActions from './components/QuickActions.vue';
import LowStockAlerts from './components/LowStockAlerts.vue';
import RecentOrders from './components/RecentOrders.vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { notifyError } from 'src/utils/notify';

const $q = useQuasar();
const { summary, refresh: refreshSummary } = useDashboardSummary();

const kpiCards = computed(() => [
    { label: '총 품목 수', value: summary.value.totalArticles, color: 'bg-primary' },
    { label: '총 재고', value: summary.value.totalStock, color: 'bg-teal' },
    { label: '판매 가능 수량', value: summary.value.sellableStock, color: 'bg-positive' },
    { label: '오늘 주문', value: summary.value.ordersToday, color: 'bg-orange' },
    { label: '구역 수', value: summary.value.zoneCount, color: 'bg-deep-purple' },
    { label: '로케이션(칸)', value: summary.value.locationCount, color: 'bg-indigo' },
    { label: '총 할당', value: summary.value.totalAllocated, color: 'bg-cyan' },
    { label: '오늘 이동', value: summary.value.movementsToday, color: 'bg-blue-grey' },
    { label: '오늘 반품', value: summary.value.returnsToday, color: 'bg-purple' },
]);

const lowStockArticles = computed(() => summary.value.lowStockArticles);

const recentOrders = computed(() => summary.value.recentOrders);

async function loadAll() {
    await refreshSummary();
}

function confirmReset() {
    $q.dialog({
        title: '데모 초기화',
        message: '모든 데이터가 초기화되고 시드 상태로 복원됩니다. 계속할까요?',
        cancel: true,
        persistent: true,
    }).onOk(() => {
        void api.post('/api/v1/reset')
            .then(() => loadAll())
            .then(() => {
                $q.notify({ type: 'positive', message: '데이터가 시드 상태로 초기화되었습니다.' });
            })
            .catch((err) => {
                notifyError(err, '초기화에 실패했습니다.');
            });
    });
}
</script>

<template>
    <q-page padding>
        <div class="row items-center q-mb-lg">
            <div class="text-h4 col">대시보드</div>
            <q-btn flat color="negative" icon="restart_alt" label="demo reset" @click="confirmReset" />
        </div>

        <KPICards :cards="kpiCards" />
        <QuickActions />
        <LowStockAlerts :articles="lowStockArticles" />
        <RecentOrders :orders="recentOrders" />
    </q-page>
</template>
