<script setup lang="ts">
import MoveStockCard from './components/MoveStockCard.vue';
import AdjustmentCard from './components/AdjustmentCard.vue';
import TransactionLog from './components/TransactionLog.vue';
</script>

<template>
    <q-page padding class="movements-page">
        <div class="row items-center q-mb-lg">
            <div class="text-h4 col">재고 이동 및 조정</div>
            <q-btn flat icon="qr_code_scanner" label="스캐너" color="teal" :to="{ name: 'scanner' }" />
        </div>

        <div class="row q-col-gutter-lg">
            <div class="col-12 col-md-6">
                <MoveStockCard />
            </div>
            <div class="col-12 col-md-6">
                <AdjustmentCard />
            </div>
        </div>

        <div class="q-mt-lg">
            <TransactionLog />
        </div>
    </q-page>
</template>
