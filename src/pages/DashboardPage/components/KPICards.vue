<script setup lang="ts">
export interface KPICard {
    label: string;
    value: number;
    color: string;
}

defineProps<{ cards: KPICard[] }>();
</script>

<template>
    <div class="row q-col-gutter-md">
        <div v-for="card in cards" :key="card.label" class="col-12 col-sm-6 col-md-3">
            <q-card :class="[card.color, 'text-white']">
                <q-card-section>
                    <div class="text-subtitle2">{{ card.label }}</div>
                    <div class="text-h3">{{ card.value }}</div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>
