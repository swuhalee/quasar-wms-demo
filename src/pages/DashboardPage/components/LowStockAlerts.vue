<script setup lang="ts">
import type { Article } from "src/models/Article";

defineProps<{ artices: Article[] }>();
</script>

<template>
    <div class="q-mt-lg">
        <div class="text-h5 q-mb-sm">재고 부족 알림</div>

        <q-card v-if="artices.length === 0" flat bordered>
            <q-card-section class="text-positive">
                <q-icon name="check_circle" size="sm" class="q-mr-sm" />
                모든 품목 재고가 충분합니다.
            </q-card-section>
        </q-card>

        <q-list v-else bordered separator class="rounded-borders">
            <q-item v-for="article in artices" :key="article.articleSystemId">
                <q-item-section avatar>
                    <q-icon name="warning" color="nagetive" />
                </q-item-section>

                <q-item-section>
                    <q-item-label>{{ article.articleName }}</q-item-label>
                    <q-item-label>{{ article.articleNumber }}</q-item-label>
                </q-item-section>

                <q-item-section side>
                    <q-badge color="negative" :label="`${article.inventoryInfo.sellableNumberOfItems}개 남음`" />
                </q-item-section>
            </q-item>
        </q-list>
    </div>
</template>
