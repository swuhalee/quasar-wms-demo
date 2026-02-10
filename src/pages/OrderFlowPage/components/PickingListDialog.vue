<script setup lang="ts">
import { useDialogPluginComponent, useQuasar, type QTableColumn } from 'quasar';
import { usePickingList } from 'src/composables/useOrderQuery';
import MobilePickingView from './MobilePickingView.vue';

interface Props {
    orderId: number;
}

const props = defineProps<Props>();

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const { pickingList, isLoading: fetchPickingListLoading } = usePickingList(() => props.orderId);

const pickingColumns: QTableColumn[] = [
    { name: 'locationName', label: '로케이션', field: 'locationName', align: 'left' },
    { name: 'articleNumber', label: 'SKU', field: 'articleNumber', align: 'left' },
    { name: 'articleName', label: '품목', field: 'articleName', align: 'left' },
    { name: 'quantityToPick', label: '픽 수량', field: 'quantityToPick', align: 'center' },
];

function locationColor(name: string): string {
    if (name.startsWith('PICK')) return 'orange';
    if (name.startsWith('BULK')) return 'teal';
    if (name.startsWith('RCV')) return 'blue';
    if (name.startsWith('SHIP')) return 'green';
    return 'grey';
}


const $q = useQuasar();

function openMobilePicking() {
    $q.dialog({
        component: MobilePickingView,
        componentProps: {
            orderNumber: pickingList.value?.orderNumber ?? '',
            items: pickingList.value?.items ?? [],
        },
    });
}
</script>

<template>
    <q-dialog ref="dialogRef" full-width @hide="onDialogHide">
        <q-card>
            <q-card-section class="bg-primary text-white row items-center">
                <div class="text-h6">
                    <!-- &mdash: 특수문자(-) -->
                    픽 리스트 &mdash; {{ pickingList?.orderNumber }}
                </div>

                <q-space />

                <q-btn v-if="pickingList && pickingList.items.length > 0" flat icon="phone_android" label="PDA 뷰"
                    color="white" class="q-mr-sm" @click="openMobilePicking" />

                <q-btn flat round icon="close" color="white" @click="onDialogCancel" />
            </q-card-section>

            <q-card-section v-if="fetchPickingListLoading" class="text-center q-pa-xl">
                <q-spinner size="32px" color="primary" />
            </q-card-section>

            <q-card-section v-else-if="pickingList">
                <q-banner v-if="pickingList.items.length === 0" class="bg-warning text-white">
                    이 주문에 대한 픽 로케이션이 없습니다.
                </q-banner>

                <q-table v-else flat bordered :rows="pickingList.items" :columns="pickingColumns"
                    row-key="orderLineRowNumber" hide-pagination :rows-per-page-options="[0]">
                    <template #body-cell-locationName="props">
                        <q-td :props="props">
                            <q-badge :color="locationColor(props.row.locationName)" :label="props.row.locationName" />
                        </q-td>
                    </template>
                </q-table>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
