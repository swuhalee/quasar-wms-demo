<script setup lang="ts">
import { type Order, OrderStatusId } from 'src/models/Order';
import { useOrders, useProcessOrder } from 'src/composables/useOrderQuery';
import { useQuasar } from 'quasar';
import PickingListDialog from './PickingListDialog.vue';

const $q = useQuasar();
const { orders } = useOrders();
const { processOrder, isLoading: processLoading } = useProcessOrder();

const stages = [
    {
        statusId: OrderStatusId.Created,
        label: '생성됨',
        color: 'blue',
        nextAction: '픽',
        nextIcon: 'inventory',
        nextColor: 'orange',
    },
    {
        statusId: OrderStatusId.Picked,
        label: '픽 완료',
        color: 'orange',
        nextAction: '출고',
        nextIcon: 'local_shipping',
        nextColor: 'positive',
    },
    {
        statusId: OrderStatusId.Shipped,
        label: '출고 완료',
        color: 'positive',
        nextAction: null,
        nextIcon: null,
        nextColor: null,
    },
];

function ordersForStage(statusId: OrderStatusId) {
    return orders.value.filter((o) => o.orderStatus.statusId === statusId);
}

function totalQty(order: Order) {
    return order.orderLines.reduce((sum, l) => sum + l.orderedNumberOfItems, 0);
}

async function advanceOrder(orderId: number) {
    try {
        const updated = await processOrder(orderId);
        $q.notify({
            type: 'positive',
            message: `주문이 "${updated.orderStatus.statusText}"(으)로 진행되었습니다.`,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '주문 진행에 실패했습니다.';
        $q.notify({ type: 'negative', message });
    }
}

function openPickingListDialog(orderId: number) {
    $q.dialog({
        component: PickingListDialog,
        componentProps: { orderId },
    });
}
</script>

<template>
    <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="stage in stages" :key="stage.statusId" class="col-12 col-md-4">
            <q-card flat bordered>
                <q-card-section :class="`bg-${stage.color} text-white`">
                    <div class="text-subtitle1">{{ stage.label }}</div>
                    <div class="text-h5">{{ ordersForStage(stage.statusId).length }}</div>
                </q-card-section>

                <q-separator />

                <q-list separator>
                    <q-item v-for="order in ordersForStage(stage.statusId)" :key="order.orderId">
                        <q-item-section>
                            <q-item-label>{{ order.orderNumber }}</q-item-label>
                            <q-item-label caption>
                                <!-- &middot: 특수문자(·) -->
                                {{ order.orderLines.length }}라인 &middot;
                                {{ totalQty(order) }}건
                            </q-item-label>
                        </q-item-section>

                        <q-item-section side>
                            <div class="row no-wrap q-gutter-xs">
                                <q-btn v-if="stage.statusId === OrderStatusId.Created" dense flat icon="list_alt"
                                    color="primary" @click="openPickingListDialog(order.orderId)">
                                    <q-tooltip>픽 리스트 보기</q-tooltip>
                                </q-btn>

                                <q-btn v-if="stage.nextAction" dense flat :icon="stage.nextIcon"
                                    :color="stage.nextColor" :loading="processLoading"
                                    @click="advanceOrder(order.orderId)">
                                    <q-tooltip>{{ stage.nextAction }}</q-tooltip>
                                </q-btn>
                            </div>
                        </q-item-section>
                    </q-item>

                    <q-item v-if="ordersForStage(stage.statusId).length === 0">
                        <q-item-section class="text-grey text-center">주문 없음</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </div>
    </div>
</template>
