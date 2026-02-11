<script setup lang="ts">
import { useZones } from 'src/composables/useWarehouseQuery';
import LocationCard from './components/LocationCard.vue';

const { zones, isLoading: zonesLoading } = useZones();

function zoneIcon(code: string): string {
    const map: Record<string, string> = {
        RCV: 'input',
        BULK: 'warehouse',
        PICK: 'shopping_basket',
        SHIP: 'local_shipping',
    };
    return map[code] ?? 'place';
}

function zoneColor(code: string): string {
    const map: Record<string, string> = {
        RCV: 'blue',
        BULK: 'teal',
        PICK: 'orange',
        SHIP: 'green',
    };
    return map[code] ?? 'grey';
}
</script>

<template>
    <q-page padding>
        <div class="text-h4 q-mb-lg">창고 지도</div>

        <div v-if="zonesLoading" class="text-center q-pa-xl">
            <q-spinner size="48px" color="primary" />
        </div>

        <div v-else>
            <div v-for="zone in zones" :key="zone.zoneId" class="q-mb-lg">
                <div class="text-h6 q-mb-sm">
                    <q-icon :name="zoneIcon(zone.zoneCode)" class="q-mr-sm" />
                    {{ zone.zoneName }}
                    <q-badge :color="zoneColor(zone.zoneCode)" :label="zone.zoneCode" class="q-ml-sm" />
                </div>

                <div class="row q-col-gutter-sm">
                    <div v-for="loc in zone.locations" :key="loc.locationId" class="col-6 col-sm-4 col-md-3 col-lg-2">
                        <LocationCard :location="loc" />
                    </div>
                </div>
            </div>
        </div>
    </q-page>
</template>
