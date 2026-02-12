<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useArticles } from 'src/composables/useArticleQuery';
import { useOrders } from 'src/composables/useOrderQuery';
import { useLocations } from 'src/composables/useWarehouseQuery';
import { useSimulateWebhook } from 'src/composables/useWebhookQuery';
import { OrderStatusId } from 'src/models/Order';
import { ReturnCauseLabel } from 'src/models/ReturnOrder';
import { WebhookEventType } from 'src/models/Webhook';
import { computed, reactive, ref } from 'vue';

const $q = useQuasar();

const { orders } = useOrders();
const { articles } = useArticles();
const { locations } = useLocations();
const { simulateWebhook } = useSimulateWebhook();

const submitting = ref(false);
const eventType = ref<WebhookEventType>(WebhookEventType.CarrierStatusUpdate);
const payload = reactive<Record<string, string | number | null>>({});

const eventTypeOptions = [
    { label: '배송 상태 업데이트', value: WebhookEventType.CarrierStatusUpdate },
    { label: '공급자 출고 통보', value: WebhookEventType.SupplierShipmentNotice },
    { label: '외부 재고 동기화', value: WebhookEventType.ExternalInventorySync },
    { label: '반품 접수', value: WebhookEventType.ReturnInitiated },
];

const pickedOrderOptions = computed(() =>
    orders.value
        .filter((o) => o.orderStatus.statusId === OrderStatusId.Picked)
        .map((o) => ({ label: o.orderNumber, value: o.orderNumber })),
);

const shippedOrderOptions = computed(() =>
    orders.value
        .filter((o) => o.orderStatus.statusId === OrderStatusId.Shipped)
        .map((o) => ({ label: o.orderNumber, value: o.orderNumber })),
);

const articleOptions = computed(() =>
    articles.value.map((a) => ({
        label: `${a.articleNumber} - ${a.articleName}`,
        value: a.articleNumber,
    })),
);

const locationOptions = computed(() =>
    locations.value.map((l) => ({ label: l.locationName, value: l.locationId })),
);

const causeOptions = Object.entries(ReturnCauseLabel).map(([val, label]) => ({
    label,
    value: val,
}));

async function simulate() {
    submitting.value = true;
    try {
        await simulateWebhook({ eventType: eventType.value, payload: { ...payload } });
        $q.notify({ type: 'positive', message: '웹훅 이벤트가 시뮬레이션되었습니다.' });
    } catch (err: unknown) {
        $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '시뮬레이션에 실패했습니다.' });
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <q-card flat bordered>
        <q-card-section class="bg-indigo text-white">
            <div class="text-h6"><q-icon name="webhook" class="q-mr-sm" />웹훅 시뮬레이터</div>
            <div class="text-caption">외부 시스템 이벤트 시뮬레이션</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
            <q-select v-model="eventType" :options="eventTypeOptions" label="이벤트 유형" outlined dense emit-value
                map-options />

            <!-- CarrierStatusUpdate -->
            <template v-if="eventType === 'CARRIER_STATUS_UPDATE'">
                <q-select v-model="payload.orderNumber" :options="pickedOrderOptions" label="주문 (픽 완료)" outlined dense
                    emit-value map-options />
            </template>

            <!-- SupplierShipmentNotice -->
            <template v-if="eventType === 'SUPPLIER_SHIPMENT_NOTICE'">
                <q-select v-model="payload.articleNumber" :options="articleOptions" label="품목" outlined dense emit-value
                    map-options />
                <q-input v-model.number="payload.quantity" type="number" label="수량" outlined dense :min="1" />
            </template>

            <!-- ExternalInventorySync -->
            <template v-if="eventType === 'EXTERNAL_INVENTORY_SYNC'">
                <q-select v-model="payload.articleNumber" :options="articleOptions" label="품목" outlined dense emit-value
                    map-options />
                <q-select v-model="payload.locationId" :options="locationOptions" label="로케이션" outlined dense emit-value
                    map-options />
                <q-input v-model.number="payload.newQuantity" type="number" label="신규 수량" outlined dense :min="0" />
            </template>

            <!-- ReturnInitiated -->
            <template v-if="eventType === 'RETURN_INITIATED'">
                <q-select v-model="payload.orderNumber" :options="shippedOrderOptions" label="주문 (출고 완료)" outlined dense
                    emit-value map-options />
                <q-select v-model="payload.articleNumber" :options="articleOptions" label="품목" outlined dense emit-value
                    map-options />
                <q-input v-model.number="payload.quantity" type="number" label="수량" outlined dense :min="1" />
                <q-select v-model="payload.cause" :options="causeOptions" label="반품 사유" outlined dense emit-value
                    map-options />
            </template>
        </q-card-section>
        <q-card-actions align="right">
            <q-btn color="indigo" label="이벤트 시뮬레이션" icon="play_arrow" :loading="submitting" @click="simulate" />
        </q-card-actions>
    </q-card>
</template>
