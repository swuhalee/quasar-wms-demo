<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useArticles } from 'src/composables/useArticleQuery';
import { useCreateMovement } from 'src/composables/useMovementQuery';
import { useArticleItemLocations, useLocations } from 'src/composables/useWarehouseQuery';
import { computed, reactive, ref } from 'vue';

const $q = useQuasar();
const { articles } = useArticles();
const { articleItemLocations } = useArticleItemLocations();
const { locations } = useLocations();
const { createMovement } = useCreateMovement();

const moveStep = ref(1);
const submitting = ref(false);

const form = reactive({
    articleNumber: '',
    fromLocationId: null as number | null,
    toLocationId: null as number | null,
    quantity: 1,
});

const articleOptions = computed(() =>
    articles.value.map((a) => ({
        label: `${a.articleNumber} - ${a.articleName}`,
        value: a.articleNumber,
    })),
);

const sourceLocationOptions = computed(() => {
    if (!form.articleNumber) return [];
    return articleItemLocations.value
        .filter((ail) => ail.articleNumber === form.articleNumber && ail.quantity - ail.allocatedQuantity > 0)
        .map((ail) => {
            const loc = locations.value.find((l) => l.locationId === ail.locationId);
            const avail = ail.quantity - ail.allocatedQuantity;
            return {
                label: `${loc?.locationName ?? `LOC-${ail.locationId}`} (가용: ${avail})`,
                value: ail.locationId,
            };
        });
});

const destLocationOptions = computed(() =>
    locations.value
        .filter((l) => l.locationId !== form.fromLocationId)
        .map((l) => ({ label: l.locationName, value: l.locationId })),
);

const maxMoveQty = computed(() => {
    if (!form.articleNumber || !form.fromLocationId) return 0;
    const ail = articleItemLocations.value.find(
        (r) => r.articleNumber === form.articleNumber && r.locationId === form.fromLocationId,
    );
    return ail ? ail.quantity - ail.allocatedQuantity : 0;
});

function resetForm() {
    form.articleNumber = '';
    form.fromLocationId = null;
    form.toLocationId = null;
    form.quantity = 1;
    moveStep.value = 1;
}

async function submit() {
    if (!form.fromLocationId || !form.toLocationId) return;
    submitting.value = true;
    try {
        await createMovement({
            articleNumber: form.articleNumber,
            fromLocationId: form.fromLocationId,
            toLocationId: form.toLocationId,
            quantity: form.quantity,
        });
        $q.notify({ type: 'positive', message: '재고가 이동되었습니다.' });
        resetForm();
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '이동에 실패했습니다.';
        $q.notify({ type: 'negative', message });
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <q-card flat bordered>
        <q-card-section class="bg-primary text-white">
            <div class="text-h6">재고 이동</div>
            <div class="text-caption">로케이션 간 품목 이송</div>
        </q-card-section>

        <q-card-section>
            <q-stepper v-model="moveStep" vertical animated color="primary">
                <q-step :name="1" title="품목 선택" icon="inventory_2" :done="moveStep > 1">
                    <q-select v-model="form.articleNumber" :options="articleOptions" label="품목" outlined dense
                        emit-value map-options />
                    <q-stepper-navigation>
                        <q-btn color="primary" label="다음" :disable="!form.articleNumber" @click="moveStep = 2" />
                    </q-stepper-navigation>
                </q-step>

                <q-step :name="2" title="출발 로케이션" icon="output" :done="moveStep > 2">
                    <q-select v-model="form.fromLocationId" :options="sourceLocationOptions" label="출발 로케이션"
                        outlined dense emit-value map-options />
                    <q-stepper-navigation>
                        <q-btn color="primary" label="다음" :disable="!form.fromLocationId" @click="moveStep = 3" />
                        <q-btn flat color="primary" label="이전" class="q-ml-sm" @click="moveStep = 1" />
                    </q-stepper-navigation>
                </q-step>

                <q-step :name="3" title="도착 로케이션 및 수량" icon="input" :done="moveStep > 3">
                    <q-select v-model="form.toLocationId" :options="destLocationOptions" label="도착 로케이션" outlined
                        dense emit-value map-options class="q-mb-sm" />
                    <q-input v-model.number="form.quantity" type="number" label="수량" outlined dense :min="1"
                        :max="maxMoveQty" :hint="`최대 가용: ${maxMoveQty}`" />
                    <q-stepper-navigation>
                        <q-btn color="primary" label="이동 실행" class="pda-touch-target"
                            :disable="!form.toLocationId || form.quantity <= 0" :loading="submitting" @click="submit" />
                        <q-btn flat color="primary" label="이전" class="q-ml-sm" @click="moveStep = 2" />
                    </q-stepper-navigation>
                </q-step>
            </q-stepper>
        </q-card-section>
    </q-card>
</template>
