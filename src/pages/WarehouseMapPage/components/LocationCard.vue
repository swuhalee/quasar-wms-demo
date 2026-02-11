<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useArticleItemLocations } from 'src/composables/useWarehouseQuery';
import LocationDetailPanel from './LocationDetailPanel.vue';
import type { Location } from 'src/models/Warehouse';

interface Props {
    location: Location;
}

const props = defineProps<Props>();

const { articleItemLocations } = useArticleItemLocations();

const $q = useQuasar();
function openLocationDetailPanel() {
    console.log(props.location);
    $q.dialog({
        component: LocationDetailPanel,
        componentProps: { location: props.location },
    });
}

function itemsAtLocation() {
    return articleItemLocations.value.filter((ail) => ail.locationId === props.location.locationId);
}
</script>

<template>
    <q-card flat bordered class="cursor-pointer location-card" @click="openLocationDetailPanel()">
        <q-card-section class="q-pa-sm text-center">
            <div class="text-subtitle2 text-weight-bold">{{ location.locationName }}</div>
            <q-separator class="q-my-xs" />
            <div v-if="itemsAtLocation().length === 0" class="text-grey text-caption">
                비어 있음
            </div>
            <div v-else>
                <div v-for="item in itemsAtLocation()" :key="item.articleNumber" class="text-caption q-my-xs">
                    <div class="text-left text-weight-bold">{{ item.articleNumber }}</div>
                    <div class="row justify-between no-wrap">
                        <span>수량: {{ item.quantity }}</span>
                        <div class="text-green-8">
                            가용: {{ item.quantity - item.allocatedQuantity }}
                        </div>
                        <q-badge v-if="item.allocatedQuantity > 0" color="orange" text-color="white"
                            :label="`할당: ${item.allocatedQuantity}`" dense />
                    </div>
                </div>
            </div>
        </q-card-section>
    </q-card>
</template>

<style scoped>
.location-card {
    transition: background-color 0.2s;
}

.location-card:hover {
    background-color: #e3f2fd;
}
</style>