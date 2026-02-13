<script setup lang="ts">
import { useQuasar, useDialogPluginComponent } from 'quasar';
import { useArticles } from 'src/composables/useArticleQuery';
import { useCreatePurchaseOrder } from 'src/composables/usePurchaseOrderQuery';
import { notifyError } from 'src/utils/notify';
import { computed, reactive } from 'vue';

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const { articles } = useArticles();
const { createPurchaseOrder, isLoading: createLoading } = useCreatePurchaseOrder();

const poForm = reactive({
    purchaseOrderNumber: '',
    purchaseOrderRemark: '',
    lines: [{ articleNumber: '', orderedNumberOfItems: 1 }],
});
const articleOptions = computed(() =>
    articles.value.map((a) => ({
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
        await createPurchaseOrder({
            purchaseOrderNumber: poForm.purchaseOrderNumber,
            purchaseOrderLines: validLines.map((l, i) => ({
                rowNumber: i + 1,
                articleNumber: l.articleNumber,
                orderedNumberOfItems: l.orderedNumberOfItems,
            })),
            purchaseOrderRemark: poForm.purchaseOrderRemark,
        });

        $q.notify({ type: 'positive', message: '입고 오더가 제출되었고 재고가 갱신되었습니다.' });
        onDialogOK({ purchaseOrderNumber: poForm.purchaseOrderNumber });
    } catch (err: unknown) {
        notifyError(err, '입고 오더 제출에 실패했습니다.');
    }
}
</script>

<template>
    <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
        <q-card style="min-width: 500px">
            <q-card-section>
                <div class="text-h6">입고 처리</div>
            </q-card-section>

            <q-card-section>
                <q-input v-model="poForm.purchaseOrderNumber" label="PO 번호" outlined dense class="q-mb-sm" />
                <q-input v-model="poForm.purchaseOrderRemark" label="비고" outlined dense />

                <div class="text-subtitle2 q-mt-md">라인</div>
                <div v-for="(line, idx) in poForm.lines" :key="idx" class="row q-col-gutter-sm items-center q-mb-sm">
                    <div class="col">
                        <q-select v-model="line.articleNumber" :options="articleOptions" label="품목" outlined dense
                            emit-value map-options class="q-mr-sm" />
                    </div>
                    <div class="col-3">
                        <q-input v-model.number="line.orderedNumberOfItems" type="number" label="수량" outlined dense
                            :min="1" class="q-mr-sm" />
                    </div>
                    <div class="col-auto">
                        <q-btn flat round icon="delete" color="negative" size="sm" :disable="poForm.lines.length <= 1"
                            @click="poForm.lines.splice(idx, 1)" />
                    </div>
                </div>
                <q-btn flat icon="add" padding="2px 6px" label="라인 추가" color="primary" @click="addPoLine" />
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="취소" @click="onDialogCancel" />
                <q-btn color="primary" label="입고 제출" :loading="createLoading" @click="submitPurchaseOrder" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
