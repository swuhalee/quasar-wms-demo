<script setup lang="ts">
import { computed } from 'vue';
import { useArticleStore } from 'stores/article-store';
import { useOrderStore } from 'stores/order-store';
import { useWarehouseStore } from 'stores/warehouse-store';
import { useMovementStore } from 'stores/movement-store';
import { useReturnOrderStore } from 'stores/return-order-store';
import KPICards from './components/KPICards.vue';
import QuickActions from './components/QuickActions.vue';
import LowStockAlerts from './components/LowStockAlerts.vue';
import RecentOrders from './components/RecentOrders.vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const articleStore = useArticleStore();
const orderStore = useOrderStore();
const warehouseStore = useWarehouseStore();
const movementStore = useMovementStore();
const returnOrderStore = useReturnOrderStore();

const today = () => new Date().toISOString().slice(0, 10);

const kpiCards = computed(() => [
    { label: '총 품목 수', value: articleStore.articles.length, color: 'bg-primary' },
    { label: '총 재고', value: articleStore.articles.reduce((s, a) => s + a.inventoryInfo.numberOfItems, 0), color: 'bg-teal' },
    { label: '판매 가능 수량', value: articleStore.articles.reduce((s, a) => s + a.inventoryInfo.sellableNumberOfItems, 0), color: 'bg-positive' },
    { label: '오늘 주문', value: orderStore.orders.filter((o) => o.createdDate.slice(0, 10) === today()).length, color: 'bg-orange' },
    { label: '구역 수', value: warehouseStore.zones.length, color: 'bg-deep-purple' },
    { label: '로케이션(칸)', value: warehouseStore.locations.length, color: 'bg-indigo' },
    { label: '총 할당', value: warehouseStore.articleItemLocations.reduce((s, ail) => s + ail.allocatedQuantity, 0), color: 'bg-cyan' },
    { label: '오늘 이동', value: movementStore.movements.filter((m) => m.movedDate.slice(0, 10) === today()).length, color: 'bg-blue-grey' },
    { label: '오늘 반품', value: returnOrderStore.returnOrders.filter((r) => r.createdDate.slice(0, 10) === today()).length, color: 'bg-purple' },
]);

const lowStockArticles = computed(() =>
    articleStore.articles.filter((a) => a.inventoryInfo.sellableNumberOfItems < 10),
);

const recentOrders = orderStore.orders;

async function loadAll() {
    await Promise.all([
        articleStore.fetchArticles(),
        orderStore.fetchOrders(),
        warehouseStore.fetchAll(),
        movementStore.fetchAll(),
        returnOrderStore.fetchReturnOrders(),
        returnOrderStore.fetchCauseSummary(),
    ]);
}

function confirmReset() {
    $q.dialog({
        title: '데모 초기화',
        message: '모든 데이터가 초기화되고 시드 상태로 복원됩니다. 계속할까요?',
        cancel: true,
        persistent: true,
    }).onOk(() => {
        void api.post('/api/v1/reset').then(() =>
            loadAll().then(() => {
                $q.notify({ type: 'positive', message: '데이터가 시드 상태로 초기화되었습니다.' });
            }),
        );
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
        <LowStockAlerts :artices="lowStockArticles" />
        <RecentOrders :orders="recentOrders" />
    </q-page>
</template>
