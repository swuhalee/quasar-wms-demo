<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useArticles } from 'src/composables/useArticleQuery';
import { useCreateOrder } from 'src/composables/useOrderQuery';
import { computed, reactive } from 'vue';

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const { articles } = useArticles();
const { createOrder, isLoading: createLoading } = useCreateOrder();

const orderForm = reactive({
    orderNumber: '',
    orderRemark: '',
    lines: [{ articleNumber: '', orderedNumberOfItems: 1 }],
});

const articleOptions = computed(() =>
    articles.value.map((a) => ({
        label: `${a.articleNumber} - ${a.articleName} (${a.inventoryInfo.sellableNumberOfItems}개 가능)`,
        value: a.articleNumber,
    })),
);

function addOrderLine() {
    orderForm.lines.push({ articleNumber: '', orderedNumberOfItems: 1 });
}

async function submitOrder() {
    if (!orderForm.orderNumber) {
        $q.notify({ type: 'warning', message: '주문 번호를 입력하세요.' });
        return;
    }
    const validLines = orderForm.lines.filter((l) => l.articleNumber && l.orderedNumberOfItems > 0);
    if (validLines.length === 0) {
        $q.notify({ type: 'warning', message: '유효한 라인이 최소 1개 필요합니다.' });
        return;
    }

    try {
        await createOrder({
            orderNumber: orderForm.orderNumber,
            orderLines: validLines.map((l, i) => ({
                rowNumber: i + 1,
                articleNumber: l.articleNumber,
                orderedNumberOfItems: l.orderedNumberOfItems,
            })),
            orderRemark: orderForm.orderRemark,
        });

        $q.notify({ type: 'positive', message: '주문이 생성되었고 재고가 할당되었습니다.' });
        onDialogOK();
        resetOrderForm();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '주문 생성에 실패했습니다.';
        $q.notify({ type: 'negative', message });
    }
}


function resetOrderForm() {
    orderForm.orderNumber = '';
    orderForm.orderRemark = '';
    orderForm.lines = [{ articleNumber: '', orderedNumberOfItems: 1 }];
}

</script>

<template>
    <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
        <q-card style="min-width: 500px">
            <q-card-section>
                <div class="text-h6">출고 주문 생성</div>
            </q-card-section>

            <!-- q-gutter-sm: gap -->
            <q-card-section>
                <q-input v-model="orderForm.orderNumber" label="주문 번호" outlined dense class="q-mb-sm" />
                <q-input v-model="orderForm.orderRemark" label="비고" outlined dense />

                <div class="text-subtitle2 q-mt-md">주문 라인</div>
                <div v-for="(line, idx) in orderForm.lines" :key="idx" class="row items-center q-mb-sm">
                    <div class="col">
                        <q-select v-model="line.articleNumber" :options="articleOptions" label="품목" outlined dense
                            emit-value map-options class="q-mr-sm" />
                    </div>
                    <div class="col-3">
                        <q-input v-model.number="line.orderedNumberOfItems" type="number" label="수량" outlined dense
                            :min="1" class="q-mr-sm" />
                    </div>
                    <div class="col-auto">
                        <q-btn flat round icon="delete" color="negative" size="sm"
                            :disable="orderForm.lines.length <= 1" @click="orderForm.lines.splice(idx, 1)" />
                    </div>
                </div>
                <q-btn flat icon="add" padding="2px 6px" label="라인 추가" color="primary" @click="addOrderLine"
                    class="q-pd-sm" />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="취소" @click="onDialogCancel" />
                <q-btn color="primary" label="주문 등록" :loading="createLoading" @click="submitOrder" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
