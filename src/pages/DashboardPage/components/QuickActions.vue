<script setup lang="ts">
const quickActions = [
    { label: '분석', icon: 'analytics', color: 'primary', to: { name: 'analytics' } },
    { label: '반품', icon: 'assignment_return', color: 'purple', to: { name: 'returns' } },
    { label: '스캐너', icon: 'qr_code_scanner', color: 'teal', to: { name: 'scanner' } },
    { label: '로그', icon: 'history', color: 'blue-grey', to: { name: 'audit' } },
    { label: '워크플로우', icon: 'account_tree', color: 'indigo', to: { name: 'workflows' } },
    { label: '자동화', icon: 'smart_toy', color: 'orange', to: { name: 'automation' } }
];
</script>

<template>
    <div class="q-mt-lg">
        <div class="text-h5 q-mb-sm">바로가기</div>

        <div class="row q-col-gutter-sm">
            <div v-for="action in quickActions" :key="action.label" class="col-6 col-sm-4 col-md">
                <q-btn outline no-caps class="full-width" :icon="action.icon" :label="action.label"
                    :color="action.color" :to="action.to" />
            </div>
        </div>
    </div>
</template>
