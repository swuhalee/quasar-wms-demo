<script setup lang="ts">
import { useQuasar } from 'quasar';
import CreateReturnDialog from './components/CreateReturnDialog.vue';
import ReturnPipeline from './components/ReturnPipeline.vue';
import ReturnCauseChart from './components/ReturnCauseChart.vue';

const $q = useQuasar();

function openCreateReturnDialog() {
    $q.dialog({
        component: CreateReturnDialog,
    });
}
</script>

<template>
    <q-page padding>
        <div class="row items-center q-mb-lg">
            <div class="text-h5 q-mr-auto">반품 관리</div>
            <q-btn color="deep-purple" icon="assignment_return" label="반품 등록" @click="openCreateReturnDialog" />
        </div>

        <ReturnPipeline class="q-mb-lg" />

        <ReturnCauseChart class="q-mb-lg" />
    </q-page>
</template>
