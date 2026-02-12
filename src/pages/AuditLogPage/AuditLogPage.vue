<script setup lang="ts">
import { useArticles } from 'src/composables/useArticleQuery';
import { useArticleAuditLog, useAuditLog } from 'src/composables/useAuditLogQuery';
import { AuditAction } from 'src/models/AuditLog';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import AuditTimeline from './components/AuditTimeline.vue';
import AuditTable from './components/AuditTable.vue';

const route = useRoute();

const filterArticle = ref<string | null>((route.query.article ?? route.query.articleNumber) as string ?? null);
const filterAction = ref<string | null>(null);
const viewMode = ref<'timeline' | 'table'>('timeline');

const { articles } = useArticles();

const { allLogs, isLoading: isLoadingAll } = useAuditLog({
    enabled: () => !filterArticle.value
});

const { articleLogs, isLoading: isLoadingArticle } = useArticleAuditLog(
    () => filterArticle.value ?? '',
    { enabled: () => !!filterArticle.value }
);

const isLoading = computed(() => isLoadingAll.value || isLoadingArticle.value);

const articleFilterOptions = computed(() =>
    articles.value?.map((a) => ({
        label: `${a.articleNumber} - ${a.articleName}`,
        value: a.articleNumber,
    })) ?? []
);

const actionFilterOptions = Object.entries(AuditAction).map(([key, val]) => ({
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    value: val,
}));

const filteredLog = computed(() => {
    let log = filterArticle.value ? (articleLogs.value ?? []) : (allLogs.value ?? []);

    if (filterAction.value) {
        log = log.filter((e) => e.action === filterAction.value);
    }
    return log;
});

const actionLabels: Record<string, string> = {
    [AuditAction.PurchaseOrderReceived]: '입고 완료',
    [AuditAction.OrderCreated]: '주문 생성',
    [AuditAction.OrderPicked]: '픽 완료',
    [AuditAction.OrderShipped]: '출고 완료',
    [AuditAction.StockMoved]: '재고 이동',
    [AuditAction.StockAdjusted]: '재고 조정',
    [AuditAction.ReturnReceived]: '반품 접수',
    [AuditAction.ReturnInspected]: '반품 검수',
    [AuditAction.ReturnRestocked]: '반품 입고',
    [AuditAction.ReturnDamaged]: '반품 파손',
    [AuditAction.WebhookProcessed]: '웹훅',
};

const actionLabel = (action: string) => actionLabels[action] ?? action;

function actionIcon(action: string) {
    const map: Record<string, string> = {
        [AuditAction.PurchaseOrderReceived]: 'inventory',
        [AuditAction.OrderCreated]: 'add_shopping_cart',
        [AuditAction.OrderPicked]: 'inventory',
        [AuditAction.OrderShipped]: 'local_shipping',
        [AuditAction.StockMoved]: 'swap_horiz',
        [AuditAction.StockAdjusted]: 'tune',
        [AuditAction.ReturnReceived]: 'assignment_return',
        [AuditAction.ReturnInspected]: 'fact_check',
        [AuditAction.ReturnRestocked]: 'add_circle',
        [AuditAction.ReturnDamaged]: 'broken_image',
        [AuditAction.WebhookProcessed]: 'webhook',
    };
    return map[action] ?? 'info';
}

function actionColor(action: string) {
    const map: Record<string, string> = {
        [AuditAction.PurchaseOrderReceived]: 'teal',
        [AuditAction.OrderCreated]: 'blue',
        [AuditAction.OrderPicked]: 'orange',
        [AuditAction.OrderShipped]: 'positive',
        [AuditAction.StockMoved]: 'cyan',
        [AuditAction.StockAdjusted]: 'deep-purple',
        [AuditAction.ReturnReceived]: 'blue',
        [AuditAction.ReturnInspected]: 'orange',
        [AuditAction.ReturnRestocked]: 'positive',
        [AuditAction.ReturnDamaged]: 'negative',
        [AuditAction.WebhookProcessed]: 'indigo',
    };
    return map[action] ?? 'grey';
}
</script>

<template>
    <q-page padding>
        <div class="text-h5 q-mb-lg">작업 이력</div>

        <q-card flat bordered class="q-mb-lg">
            <q-card-section>
                <div class="row q-col-gutter-sm items-end">
                    <div class="col-12 col-sm-4">
                        <q-select v-model="filterArticle" :options="articleFilterOptions" label="품목으로 필터" outlined dense
                            clearable emit-value map-options />
                    </div>
                    <div class="col-12 col-sm-4">
                        <q-select v-model="filterAction" :options="actionFilterOptions" label="액션으로 필터" outlined dense
                            clearable emit-value map-options />
                    </div>
                    <div class="col-12 col-sm-4 text-right">
                        <q-btn-toggle v-model="viewMode" flat toggle-color="primary" :options="[
                            { label: '타임라인', value: 'timeline', icon: 'timeline' },
                            { label: '테이블', value: 'table', icon: 'table_chart' },
                        ]" />
                    </div>
                </div>
            </q-card-section>
        </q-card>

        <div v-if="isLoading" class="text-center q-pa-xl">
            <q-spinner size="48px" color="primary" />
        </div>

        <template v-else>
            <AuditTimeline v-if="viewMode === 'timeline'" :logs="filteredLog" :action-label="actionLabel"
                :action-icon="actionIcon" :action-color="actionColor" />
            <AuditTable v-else :logs="filteredLog" :action-label="actionLabel" :action-color="actionColor" />
        </template>
    </q-page>
</template>
