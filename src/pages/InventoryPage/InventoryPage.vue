<script setup lang="ts">
import { ref } from 'vue';
import ArticleTable from './components/ArticleTable.vue';
import PurchaseOrderDialog from './components/PurchaseOrderDialog.vue';
import { useArticleStore } from 'src/stores/article-store';

const articleStore = useArticleStore();
const showReceiveDialog = ref(false);
</script>

<template>
    <q-page padding>
        <div class="row items-center q-mb-lg">
            <div class="text-h4 col">재고·품목 관리</div>
            <div class="row q-gutter-sm">
                <q-btn flat icon="history" label="감사 로그" color="blue-grey" :to="{ name: 'audit' }" />
                <q-btn color="primary" icon="local_shipping" label="입고 처리" @click="showReceiveDialog = true" />
            </div>
        </div>

        <ArticleTable :articles="articleStore.articles" :loading="articleStore.loading" />

        <PurchaseOrderDialog v-model="showReceiveDialog" />
    </q-page>
</template>
