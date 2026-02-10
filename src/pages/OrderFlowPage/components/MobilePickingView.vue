<script setup lang="ts">
import { useDialogPluginComponent } from 'quasar';
import type { PickingListItem } from 'src/models/PickingList';
import { computed, ref } from 'vue';

interface Props {
    orderNumber: string;
    items: PickingListItem[];
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const currentIndex = ref(0);
const currentItem = computed(() => props.items[currentIndex.value] ?? null);
</script>

<template>
    <q-dialog ref="dialogRef" full-width full-height persistent @hide="onDialogHide">
        <q-card class="column no-wrap" style="height: 100%;">
            <q-card-section class="bg-primary text-white row items-center">
                <q-icon name="inventory" size="sm" class="q-mr-sm" />
                <div class="text-h6">픽: {{ orderNumber }}</div>
                <q-space />
                <div class="text-subtitle2">{{ currentIndex + 1 }} / {{ items.length }}</div>
                <q-btn flat round icon="close" color="white" class="q-ml-sm" @click="onDialogCancel" />
            </q-card-section>

            <q-linear-progress :value="(currentIndex + 1) / items.length" color="positive" size="8px" />

            <q-card-section v-if="currentItem" class="col q-pa-lg text-center column items-center justify-center">
                <div class="text-overline text-grey">로케이션</div>
                <div class="text-h3 text-weight-bold text-primary q-mb-md">{{ currentItem.locationName }}</div>

                <q-separator class="q-my-md" style="width: 80%" />

                <div class="text-overline text-grey">품목</div>
                <div class="text-h5 q-mb-xs">{{ currentItem.articleNumber }}</div>
                <div class="text-subtitle1 text-grey-7 q-mb-md">{{ currentItem.articleName }}</div>

                <div class="text-overline text-grey">픽 수량</div>
                <div class="text-h2 text-weight-bold text-orange">{{ currentItem.quantityToPick }}</div>
            </q-card-section>

            <q-card-actions class="q-pa-md row q-gutter-sm">
                <q-btn class="col pda-touch-target" outline color="grey" icon="arrow_back" label="이전"
                    :disable="currentIndex === 0" @click="currentIndex--" />
                <q-btn v-if="currentIndex < items.length - 1" class="col pda-touch-target" color="primary"
                    icon-right="arrow_forward" label="다음" @click="currentIndex++" />
                <q-btn v-else class="col pda-touch-target" color="positive" icon="check" label="완료"
                    @click="onDialogCancel" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
