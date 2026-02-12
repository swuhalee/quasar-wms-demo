<script setup lang="ts">
import { useQuasar } from 'quasar';
import ArticleTable from './components/ArticleTable.vue';
import PurchaseOrderDialog from './components/PurchaseOrderDialog.vue';
import { useArticles } from 'src/composables/useArticleQuery';

const $q = useQuasar();
const { articles, isLoading: articlesLoading } = useArticles();

function openReceiveDialog() {
    $q.dialog({
        component: PurchaseOrderDialog,
    });
}
</script>

<template>
    <q-page padding>
        <div class="row items-center q-mb-lg">
            <div class="text-h4 col">재고·품목 관리</div>
            <div class="row q-gutter-sm">
                <q-btn flat icon="history" label="작업 이력" color="blue-grey" :to="{ name: 'audit' }" />
                <q-btn color="primary" icon="local_shipping" label="입고 처리" @click="openReceiveDialog" />
            </div>
        </div>

        <ArticleTable :articles="articles" :loading="articlesLoading" />
    </q-page>
</template>
