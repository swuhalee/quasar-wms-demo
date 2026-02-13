<script setup lang="ts">
import { type Order, OrderStatusId } from 'src/models/Order';
import { useOrders, useProcessOrder } from 'src/composables/useOrderQuery';
import { useQuasar } from 'quasar';
import PickingListDialog from './PickingListDialog.vue';
import { computed, ref } from 'vue';
import { notifyError } from 'src/utils/notify';

const $q = useQuasar();
const { orders } = useOrders();
const { processOrder } = useProcessOrder();
const processingOrderId = ref<number | null>(null);

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

const ordersByStage = computed(() => {
    const map = new Map<OrderStatusId, Order[]>();
    for (const stage of stages) {
        map.set(stage.statusId, []);
    }
    for (const order of orders.value) {
        const list = map.get(order.orderStatus.statusId);
        if (list) list.push(order);
    }
    return map;
});

function totalQty(order: Order) {
    return order.orderLines.reduce((sum, l) => sum + l.orderedNumberOfItems, 0);
}

async function advanceOrder(orderId: number) {
    processingOrderId.value = orderId;
    try {
        const updated = await processOrder(orderId);
        $q.notify({
            type: 'positive',
            message: `주문이 "${updated.orderStatus.statusText}"(으)로 진행되었습니다.`,
        });
    } catch (err: unknown) {
        notifyError(err, '주문 진행에 실패했습니다.');
    } finally {
        processingOrderId.value = null;
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
                    <div class="text-h5">{{ ordersByStage.get(stage.statusId)?.length ?? 0 }}</div>
                </q-card-section>

                <q-separator />

                <q-list separator>
                    <q-item v-for="order in ordersByStage.get(stage.statusId)" :key="order.orderId">
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
                                    :color="stage.nextColor" :loading="processingOrderId === order.orderId"
                                    @click="advanceOrder(order.orderId)">
                                    <q-tooltip>{{ stage.nextAction }}</q-tooltip>
                                </q-btn>
                            </div>
                        </q-item-section>
                    </q-item>

                    <q-item v-if="ordersByStage.get(stage.statusId)?.length === 0">
                        <q-item-section class="text-grey text-center">주문 없음</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </div>
    </div>
</template>
