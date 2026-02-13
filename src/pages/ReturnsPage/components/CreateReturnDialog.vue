<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useArticles } from 'src/composables/useArticleQuery';
import { useOrders } from 'src/composables/useOrderQuery';
import { useCreateReturnOrder } from 'src/composables/useReturnOrderQuery';
import { OrderStatusId } from 'src/models/Order';
import { ReturnCause } from 'src/models/ReturnOrder';
import { notifyError } from 'src/utils/notify';
import { computed, reactive } from 'vue';

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const { orders } = useOrders();
const { articles } = useArticles();
const { createReturnOrder, isLoading: createLoading } = useCreateReturnOrder();

let lineId = 0;

const returnForm = reactive({
    returnOrderNumber: '',
    originalOrderNumber: '',
    returnRemark: '',
    lines: [{ id: ++lineId, articleNumber: '', qty: 1, cause: ReturnCause.Other as string }] as { id: number, articleNumber: string; qty: number; cause: string }[],
});

const shippedOrderOptions = computed(() =>
    orders.value
        .filter((o) => o.orderStatus.statusId === OrderStatusId.Shipped)
        .map((o) => ({ label: o.orderNumber, value: o.orderNumber })),
);
const articleOptions = computed(() =>
    articles.value.map((a) => ({ label: `${a.articleNumber} - ${a.articleName}`, value: a.articleNumber })),
);
const causeOptions = [
    { label: '잘못된 품목', value: ReturnCause.WrongItem },
    { label: '운송 중 파손', value: ReturnCause.DamagedInTransit },
    { label: '불량', value: ReturnCause.Defective },
    { label: '설명과 다름', value: ReturnCause.NotAsDescribed },
    { label: '마음 변경', value: ReturnCause.ChangedMind },
    { label: '기타', value: ReturnCause.Other },
];

function addCreateLine() {
    returnForm.lines.push({ id: ++lineId, articleNumber: '', qty: 1, cause: ReturnCause.Other });
}

function removeLine(id: number) {
    returnForm.lines = returnForm.lines.filter(l => l.id !== id);
}

async function submitCreate() {
    if (!returnForm.returnOrderNumber) {
        $q.notify({ type: 'warning', message: '반품 오더 번호를 입력하세요.' });
        return;
    }
    if (!returnForm.originalOrderNumber) {
        $q.notify({ type: 'warning', message: '원주문을 선택하세요.' });
        return;
    }
    const validLines = returnForm.lines.filter((l) => l.articleNumber && l.qty > 0);
    if (validLines.length === 0) {
        $q.notify({ type: 'warning', message: '유효한 라인이 최소 1개 필요합니다.' });
        return;
    }

    try {
        await createReturnOrder({
            returnOrderNumber: returnForm.returnOrderNumber,
            originalOrderNumber: returnForm.originalOrderNumber,
            returnLines: validLines.map((l, i) => ({
                rowNumber: i + 1,
                articleNumber: l.articleNumber,
                returnedNumberOfItems: l.qty,
                cause: l.cause as ReturnCause,
            })),
            returnRemark: returnForm.returnRemark,
        });
        $q.notify({ type: 'positive', message: '반품 오더가 생성되었습니다.' });
        onDialogOK();
    } catch (err: unknown) {
        notifyError(err, '반품 오더 생성에 실패했습니다.');
    }
}
</script>

<template>
    <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
        <q-card style="min-width: 550px">
            <q-card-section>
                <div class="text-h6">반품 오더 생성</div>
            </q-card-section>

            <q-card-section>
                <q-input v-model="returnForm.returnOrderNumber" label="반품 오더 번호" outlined dense class="q-mb-sm" />
                <q-select v-model="returnForm.originalOrderNumber" :options="shippedOrderOptions" label="원주문 (출고 완료)"
                    outlined dense emit-value map-options class="q-mb-sm" />
                <q-input v-model="returnForm.returnRemark" label="비고" outlined dense />

                <div class="text-subtitle2 q-mt-md">반품 라인</div>
                <div v-for="line in returnForm.lines" :key="line.id" class="row q-col-gutter-sm items-center q-mb-sm">
                    <div class="col">
                        <q-select v-model="line.articleNumber" :options="articleOptions" label="품목" outlined dense
                            emit-value map-options class="q-mr-sm" />
                    </div>
                    <div class="col-2">
                        <q-input v-model.number="line.qty" type="number" label="수량" outlined dense :min="1"
                            class="q-mr-sm" />
                    </div>
                    <div class="col-3">
                        <q-select v-model="line.cause" :options="causeOptions" label="사유" outlined dense emit-value
                            map-options class="q-mr-sm" />
                    </div>
                    <div class="col-auto">
                        <q-btn flat round icon="delete" color="negative" size="sm" @click="removeLine(line.id)" />
                    </div>
                </div>
                <q-btn flat icon="add" padding="2px 6px" label="라인 추가" color="primary" @click="addCreateLine" />
            </q-card-section>
            <q-card-actions align="right">
                <q-btn flat label="취소" @click="onDialogCancel" />
                <q-btn color="deep-purple" label="제출" :loading="createLoading" @click="submitCreate" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
