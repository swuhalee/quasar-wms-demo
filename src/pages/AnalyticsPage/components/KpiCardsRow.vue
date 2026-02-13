<script setup lang="ts">
import type { LowStockAlert, WarehousePerformance } from 'src/models/Analytics';

defineProps<{
    performances: WarehousePerformance;
    alerts: LowStockAlert[];
}>();
</script>

<template>
    <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-primary text-white">
                <q-card-section>
                    <div class="text-subtitle2">오늘 처리 주문</div>
                    <div class="text-h3">{{ performances.ordersProcessedToday ?? 0 }}</div>
                </q-card-section>
            </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-teal text-white">
                <q-card-section>
                    <div class="text-subtitle2">평균 픽 속도</div>
                    <div class="text-h3">{{ performances.averagePickingSpeed ?? 0 }}<span
                            class="text-subtitle1">/시간</span></div>
                </q-card-section>
            </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-orange text-white">
                <q-card-section>
                    <div class="text-subtitle2">픽 효율</div>
                    <div class="text-h3">{{ performances.pickingEfficiency ?? 0 }}%</div>
                </q-card-section>
            </q-card>
        </div>
        <div class="col-12 col-sm-6 col-md-3">
            <q-card class="bg-negative text-white">
                <q-card-section>
                    <div class="text-subtitle2">재고 부족 알림</div>
                    <div class="text-h3">{{ alerts.length }}</div>
                </q-card-section>
            </q-card>
        </div>
    </div>
</template>
