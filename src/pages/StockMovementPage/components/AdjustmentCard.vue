<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useArticles } from 'src/composables/useArticleQuery';
import { useCreateAdjustment } from 'src/composables/useMovementQuery';
import { useLocations } from 'src/composables/useWarehouseQuery';
import { computed, reactive, ref } from 'vue';

const $q = useQuasar();
const { articles } = useArticles();
const { locations } = useLocations();
const { createAdjustment } = useCreateAdjustment();

const submitting = ref(false);

const form = reactive({
    articleNumber: '',
    locationId: null as number | null,
    adjustedQuantity: 0,
    reason: '',
});

const articleOptions = computed(() =>
    articles.value.map((a) => ({
        label: `${a.articleNumber} - ${a.articleName}`,
        value: a.articleNumber,
    })),
);

const locationOptions = computed(() =>
    locations.value.map((l) => ({ label: l.locationName, value: l.locationId })),
);

async function submit() {
    if (!form.locationId) return;
    submitting.value = true;
    try {
        await createAdjustment({
            articleNumber: form.articleNumber,
            locationId: form.locationId,
            adjustedQuantity: form.adjustedQuantity,
            reason: form.reason,
        });
        $q.notify({ type: 'positive', message: '조정이 반영되었습니다.' });
        form.articleNumber = '';
        form.locationId = null;
        form.adjustedQuantity = 0;
        form.reason = '';
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : '조정에 실패했습니다.';
        $q.notify({ type: 'negative', message });
    } finally {
        submitting.value = false;
    }
}
</script>

<template>
    <q-card flat bordered>
        <q-card-section class="bg-orange text-white">
            <div class="text-h6">재고 조정</div>
            <div class="text-caption">실사 후 재고 보정</div>
        </q-card-section>

        <q-card-section class="q-gutter-sm">
            <q-select v-model="form.articleNumber" :options="articleOptions" label="품목" outlined dense emit-value
                map-options />
            <q-select v-model="form.locationId" :options="locationOptions" label="로케이션" outlined dense emit-value
                map-options />
            <q-input v-model.number="form.adjustedQuantity" type="number" label="조정 (+/-)" outlined dense
                hint="양수 = 더 발견, 음수 = 부족" />
            <q-input v-model="form.reason" label="사유" outlined dense />
        </q-card-section>

        <q-card-actions>
            <q-btn color="orange" label="조정 제출" class="pda-touch-target"
                :disable="!form.articleNumber || !form.locationId || form.adjustedQuantity === 0 || !form.reason"
                :loading="submitting" @click="submit" />
        </q-card-actions>
    </q-card>
</template>
