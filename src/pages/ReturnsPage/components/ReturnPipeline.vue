<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useInspectReturnOrder, useReturnOrders } from 'src/composables/useReturnOrderQuery';
import { ReturnCause, type ReturnOrder, ReturnStatusId } from 'src/models/ReturnOrder';
import { computed } from 'vue';
import ProcessReturnDialog from './ProcessReturnDialog.vue';

const $q = useQuasar();
const { returnOrders } = useReturnOrders();
const { inspectReturnOrder } = useInspectReturnOrder();

const receivedOrders = computed(() =>
    returnOrders.value.filter((r) => r.returnStatus.statusId === ReturnStatusId.Received),
);
const inspectedOrders = computed(() =>
    returnOrders.value.filter((r) => r.returnStatus.statusId === ReturnStatusId.Inspected),
);
const processedOrders = computed(() =>
    returnOrders.value.filter(
        (r) =>
            r.returnStatus.statusId === ReturnStatusId.Restocked ||
            r.returnStatus.statusId === ReturnStatusId.Damaged,
    ),
);

const causeOptions = [
    { label: '잘못된 품목', value: ReturnCause.WrongItem },
    { label: '운송 중 파손', value: ReturnCause.DamagedInTransit },
    { label: '불량', value: ReturnCause.Defective },
    { label: '설명과 다름', value: ReturnCause.NotAsDescribed },
    { label: '마음 변경', value: ReturnCause.ChangedMind },
    { label: '기타', value: ReturnCause.Other },
];

function totalReturnQty(ro: ReturnOrder) {
    return ro.returnLines.reduce((s, l) => s + l.returnedNumberOfItems, 0);
}

async function doInspect(ro: ReturnOrder) {
    try {
        await inspectReturnOrder(ro.returnOrderId);
        $q.notify({ type: 'positive', message: `${ro.returnOrderNumber} 검수 완료로 진행되었습니다.` });
    } catch (err: unknown) {
        $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '실패했습니다.' });
    }
}

function openProcessReturnDialog(ro: ReturnOrder) {
    $q.dialog({
        component: ProcessReturnDialog,
        componentProps: {
            processTarget: ro,
            processForm: ro.returnLines.map((l) => ({
                rowNumber: l.rowNumber,
                articleNumber: l.articleNumber,
                qty: l.returnedNumberOfItems,
                causeLabel: causeOptions.find((o) => o.value === l.cause)?.label ?? l.cause,
                disposition: 'restock',
                inspectionNote: '',
            })),
        },
    });
}
</script>

<template>
    <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
            <q-card flat bordered>
                <q-card-section class="bg-blue text-white">
                    <div class="row items-center no-wrap">
                        <q-icon name="inbox" size="sm" class="q-mr-sm" />
                        <div class="text-subtitle1 text-weight-bold">접수됨</div>
                        <q-space />
                        <q-badge color="white" text-color="blue" :label="receivedOrders.length" />
                    </div>
                </q-card-section>
                <q-list separator>
                    <q-item v-for="ro in receivedOrders" :key="ro.returnOrderId">
                        <q-item-section>
                            <q-item-label class="text-weight-bold">{{ ro.returnOrderNumber }}</q-item-label>
                            <q-item-label caption>원주문 {{ ro.originalOrderNumber }}</q-item-label>
                            <q-item-label caption>{{ ro.returnLines.length }}라인, {{ totalReturnQty(ro)
                                }}건</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn dense flat color="primary" icon="search" label="검수" @click="doInspect(ro)" />
                        </q-item-section>
                    </q-item>
                    <q-item v-if="receivedOrders.length === 0">
                        <q-item-section class="text-grey text-center">반품 없음</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </div>

        <div class="col-12 col-md-4">
            <q-card flat bordered>
                <q-card-section class="bg-orange text-white">
                    <div class="row items-center no-wrap">
                        <q-icon name="fact_check" size="sm" class="q-mr-sm" />
                        <div class="text-subtitle1 text-weight-bold">검수 완료</div>
                        <q-space />
                        <q-badge color="white" text-color="orange" :label="inspectedOrders.length" />
                    </div>
                </q-card-section>
                <q-list separator>
                    <q-item v-for="ro in inspectedOrders" :key="ro.returnOrderId">
                        <q-item-section>
                            <q-item-label class="text-weight-bold">{{ ro.returnOrderNumber }}</q-item-label>
                            <q-item-label caption>원주문 {{ ro.originalOrderNumber }}</q-item-label>
                            <q-item-label caption>{{ ro.returnLines.length }}라인</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn dense flat color="orange" icon="build" label="처리"
                                @click="openProcessReturnDialog(ro)" />
                        </q-item-section>
                    </q-item>
                    <q-item v-if="inspectedOrders.length === 0">
                        <q-item-section class="text-grey text-center">반품 없음</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </div>

        <div class="col-12 col-md-4">
            <q-card flat bordered>
                <q-card-section class="bg-positive text-white">
                    <div class="row items-center no-wrap">
                        <q-icon name="check_circle" size="sm" class="q-mr-sm" />
                        <div class="text-subtitle1 text-weight-bold">처리 완료</div>
                        <q-space />
                        <q-badge color="white" text-color="positive" :label="processedOrders.length" />
                    </div>
                </q-card-section>
                <q-list separator>
                    <q-item v-for="ro in processedOrders" :key="ro.returnOrderId">
                        <q-item-section>
                            <q-item-label class="text-weight-bold">{{ ro.returnOrderNumber }}</q-item-label>
                            <q-item-label caption>{{ ro.returnStatus.statusText }}</q-item-label>
                            <q-item-label caption>{{ ro.returnLines.length }}라인</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-badge :color="ro.returnStatus.statusId === 300 ? 'positive' : 'negative'"
                                :label="ro.returnStatus.statusText" />
                        </q-item-section>
                    </q-item>
                    <q-item v-if="processedOrders.length === 0">
                        <q-item-section class="text-grey text-center">반품 없음</q-item-section>
                    </q-item>
                </q-list>
            </q-card>
        </div>
    </div>
</template>
