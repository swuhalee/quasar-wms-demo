<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useArticleStore } from 'src/stores/article-store';
import { usePurchaseOrderStore } from 'stores/purchase-order-store';
import { computed, reactive } from 'vue';

const showReceiveDialog = defineModel<boolean>({ required: true });

const $q = useQuasar();
const articleStore = useArticleStore();
const poStore = usePurchaseOrderStore();

const poForm = reactive({
    purchaseOrderNumber: '',
    purchaseOrderRemark: '',
    lines: [{ articleNumber: '', orderedNumberOfItems: 1 }],
});
const articleOptions = computed(() =>
    articleStore.articles.map((a) => ({
        label: `${a.articleNumber} - ${a.articleName}`,
        value: a.articleNumber,
    })),
);

function addPoLine() {
    poForm.lines.push({ articleNumber: '', orderedNumberOfItems: 1 });
}

async function submitPurchaseOrder() {
    if (!poForm.purchaseOrderNumber) {
        $q.notify({ type: 'warning', message: 'PO 번호를 입력하세요.' });
        return;
    }
    const validLines = poForm.lines.filter((l) => l.articleNumber && l.orderedNumberOfItems > 0);
    if (validLines.length === 0) {
        $q.notify({ type: 'warning', message: '유효한 라인이 최소 1개 필요합니다.' });
        return;
    }

    try {
        await poStore.createPurchaseOrder({
            purchaseOrderNumber: poForm.purchaseOrderNumber,
            purchaseOrderLines: validLines.map((l, i) => ({
                rowNumber: i + 1,
                articleNumber: l.articleNumber,
                orderedNumberOfItems: l.orderedNumberOfItems,
            })),
            purchaseOrderRemark: poForm.purchaseOrderRemark,
        });

        showReceiveDialog.value = false;
        resetPoForm();
        $q.notify({ type: 'positive', message: '입고 오더가 제출되었고 재고가 갱신되었습니다.' });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : '입고 오더 제출에 실패했습니다.';
        $q.notify({ type: 'negative', message });
    }
}

function resetPoForm() {
    poForm.purchaseOrderNumber = '';
    poForm.purchaseOrderRemark = '';
    poForm.lines = [{ articleNumber: '', orderedNumberOfItems: 1 }];
}
</script>

<template>
    <q-dialog v-model="showReceiveDialog" persistent>
        <q-card style="min-width: 500px">
            <q-card-section>
                <div class="text-h6">입고 처리</div>
            </q-card-section>

            <q-card-section class="q-gutter-sm">
                <q-input v-model="poForm.purchaseOrderNumber" label="PO 번호" outlined dense />
                <q-input v-model="poForm.purchaseOrderRemark" label="비고" outlined dense />

                <div class="text-subtitle2 q-mt-md">라인</div>
                <div v-for="(line, idx) in poForm.lines" :key="idx" class="row q-col-gutter-sm items-center q-mb-sm">
                    <div class="col">
                        <q-select v-model="line.articleNumber" :options="articleOptions" label="품목" outlined dense
                            emit-value map-options />
                    </div>
                    <div class="col-3">
                        <q-input v-model.number="line.orderedNumberOfItems" type="number" label="수량" outlined dense
                            :min="1" />
                    </div>
                    <div class="col-auto">
                        <q-btn flat round icon="delete" color="negative" size="sm" :disable="poForm.lines.length <= 1"
                            @click="poForm.lines.splice(idx, 1)" />
                    </div>
                </div>
                <q-btn flat icon="add" label="라인 추가" color="primary" size="sm" @click="addPoLine" />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="취소" @click="showReceiveDialog = false" />
                <q-btn color="primary" label="입고 제출" :loading="poStore.createLoading" @click="submitPurchaseOrder" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
