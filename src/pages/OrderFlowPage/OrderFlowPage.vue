<script setup lang="ts">
import { useQuasar } from 'quasar';
import OrderPipeline from './components/OrderPipeline.vue';
import CreateOrderDialog from './components/CreateOrderDialog.vue';

const $q = useQuasar();

function openCreateOrderDialog() {
    $q.dialog({
        component: CreateOrderDialog,
    });
}
</script>

<template>
    <q-page padding>
        <div class="row items-center q-mb-lg">
            <div class="text-h4 col">주문 처리</div>
            <div class="row q-gutter-sm">
                <q-btn flat icon="qr_code_scanner" label="스캐너" color="teal" :to="{ name: 'scanner' }" />
                <q-btn color="primary" icon="add_shopping_cart" label="주문 생성" @click="openCreateOrderDialog" />
            </div>
        </div>

        <OrderPipeline />
    </q-page>
</template>
