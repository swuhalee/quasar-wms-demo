<script setup lang="ts">
import { computed } from 'vue';
import { useArticles } from 'src/composables/useArticleQuery';
import { useOrders } from 'src/composables/useOrderQuery';
import { useZones, useLocations, useArticleItemLocations, useWarehouses } from 'src/composables/useWarehouseQuery';
import { useMovements } from 'src/composables/useMovementQuery';
import { useReturnOrders, useReturnCauseSummary } from 'src/composables/useReturnOrderQuery';
import KPICards from './components/KPICards.vue';
import QuickActions from './components/QuickActions.vue';
import LowStockAlerts from './components/LowStockAlerts.vue';
import RecentOrders from './components/RecentOrders.vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { LOW_STOCK_THRESHOLD } from 'src/constants/inventory';
import { notifyError } from 'src/utils/notify';

const $q = useQuasar();
const { articles, refresh: refreshArticles } = useArticles();
const { orders, refresh: refreshOrders } = useOrders();
const { refresh: refreshWarehouses } = useWarehouses();
const { zones } = useZones();
const { locations } = useLocations();
const { articleItemLocations } = useArticleItemLocations();
const { movements } = useMovements();
const { returnOrders, refresh: refreshReturnOrders } = useReturnOrders();
const { refresh: refreshCauseSummary } = useReturnCauseSummary();

const today = new Date().toISOString().slice(0, 10);

const kpiCards = computed(() => [
    { label: '총 품목 수', value: articles.value.length, color: 'bg-primary' },
    { label: '총 재고', value: articles.value.reduce((s, a) => s + a.inventoryInfo.numberOfItems, 0), color: 'bg-teal' },
    { label: '판매 가능 수량', value: articles.value.reduce((s, a) => s + a.inventoryInfo.sellableNumberOfItems, 0), color: 'bg-positive' },
    { label: '오늘 주문', value: orders.value.filter((o) => o.createdDate.slice(0, 10) === today).length, color: 'bg-orange' },
    { label: '구역 수', value: zones.value.length, color: 'bg-deep-purple' },
    { label: '로케이션(칸)', value: locations.value.length, color: 'bg-indigo' },
    { label: '총 할당', value: articleItemLocations.value.reduce((s, ail) => s + ail.allocatedQuantity, 0), color: 'bg-cyan' },
    { label: '오늘 이동', value: movements.value.filter((m) => m.movedDate.slice(0, 10) === today).length, color: 'bg-blue-grey' },
    { label: '오늘 반품', value: returnOrders.value.filter((r) => r.createdDate.slice(0, 10) === today).length, color: 'bg-purple' },
]);

const lowStockArticles = computed(() =>
    articles.value.filter((a) => a.inventoryInfo.sellableNumberOfItems < LOW_STOCK_THRESHOLD),
);

const recentOrders = orders;

async function loadAll() {
    await Promise.all([
        refreshArticles(),
        refreshOrders(),
        refreshWarehouses(),
        refreshReturnOrders(),
        refreshCauseSummary(),
    ]);
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
