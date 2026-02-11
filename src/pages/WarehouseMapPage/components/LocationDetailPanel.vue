<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { useArticles } from 'src/composables/useArticleQuery';
import { useArticleItemLocations, useZones } from 'src/composables/useWarehouseQuery';
import type { Location } from 'src/models/Warehouse';
import { computed } from 'vue';

interface Props {
    location: Location;
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();

const { zones } = useZones();
const { articles } = useArticles();
const { articleItemLocations } = useArticleItemLocations();

const selectedZoneName = computed(() => {
    return zones.value.find((z) => z.zoneId === props.location.zoneId)?.zoneName ?? '';
});

const selectedItems = computed(() => {
    return articleItemLocations.value.filter((ail) => ail.locationId === props.location.locationId);
});

function articleName(articleNumber: string): string {
    return articles.value.find((a) => a.articleNumber === articleNumber)?.articleName ?? articleNumber;
}
</script>

<template>
    <q-dialog ref="dialogRef" position="right" full-height @hide="onDialogHide">
        <q-card>
            <q-card-section class="bg-primary text-white">
                <div class="text-h6">{{ location.locationName }}</div>
                <div class="text-caption">{{ selectedZoneName }}</div>
            </q-card-section>

            <q-card-section>
                <div class="text-subtitle2 q-mb-sm">이 로케이션 재고</div>
                <q-list v-if="selectedItems.length > 0" bordered separator class="rounded-borders">
                    <q-item v-for="item in selectedItems" :key="item.articleNumber">
                        <q-item-section>
                            <q-item-label>{{ articleName(item.articleNumber) }}</q-item-label>
                            <q-item-label caption>{{ item.articleNumber }}</q-item-label>
                        </q-item-section>
                        <q-item-section side class="text-right">
                            <q-item-label>수량: {{ item.quantity }}</q-item-label>
                            <q-item-label caption class="text-positive">
                                가용: {{ item.quantity - item.allocatedQuantity }}
                            </q-item-label>
                            <q-item-label v-if="item.allocatedQuantity > 0" caption class="text-orange">
                                할당: {{ item.allocatedQuantity }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
                <div v-else class="text-grey q-pa-md text-center">이 로케이션에 품목 없음</div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="닫기" color="primary" v-close-popup />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
