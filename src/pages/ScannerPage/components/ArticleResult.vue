<script setup lang="ts">
import type { QTableColumn } from 'quasar';
import type { ArticleItemLocation } from 'src/models/InventoryLocation';
import type { ScanBarcodeResult } from 'src/models/Scan';

interface Props {
    result: Extract<ScanBarcodeResult, { type: 'article' }>;
}

defineProps<Props>();

const locationColumns: QTableColumn[] = [
    { name: 'locationId', label: '로케이션 ID', field: 'locationId', align: 'left' },
    { name: 'quantity', label: '수량', field: 'quantity', align: 'center' },
    { name: 'allocatedQuantity', label: '할당', field: 'allocatedQuantity', align: 'center' },
    { name: 'available', label: '가용', field: (row: ArticleItemLocation) => row.quantity - row.allocatedQuantity, align: 'center' },
];
</script>

<template>
    <q-card flat bordered class="q-mb-lg">
        <q-card-section class="bg-primary text-white">
            <div class="row items-center">
                <q-icon name="inventory_2" size="md" class="q-mr-md" />
                <div>
                    <div class="text-h6">{{ result.data.articleName }}</div>
                    <div class="text-subtitle2">{{ result.data.articleNumber }} — {{ result.data.productCode }}
                    </div>
                </div>
            </div>
        </q-card-section>
        <q-card-section>
            <div class="row q-col-gutter-md">
                <div class="col-6 col-sm-3">
                    <div class="text-caption text-grey">실재고</div>
                    <div class="text-h5">{{ result.data.inventoryInfo.numberOfItems }}</div>
                </div>
                <div class="col-6 col-sm-3">
                    <div class="text-caption text-grey">판매 가능</div>
                    <div class="text-h5">{{ result.data.inventoryInfo.sellableNumberOfItems }}</div>
                </div>
                <div class="col-6 col-sm-3">
                    <div class="text-caption text-grey">재주문점</div>
                    <div class="text-h5">{{ result.data.reorderPoint }}</div>
                </div>
                <div class="col-6 col-sm-3">
                    <div class="text-caption text-grey">바코드</div>
                    <div class="text-h6">{{ result.data.barCodes?.[0]?.barCode ?? '—' }}</div>
                </div>
            </div>
        </q-card-section>
        <q-separator />
        <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">로케이션별 재고</div>
            <q-table flat bordered dense :rows="result.locations" :columns="locationColumns" row-key="locationId"
                hide-pagination :rows-per-page-options="[0]" />
        </q-card-section>
        <q-card-actions>
            <q-btn flat color="primary" icon="history" label="작업 이력 보기"
                :to="`/audit?article=${result.data.articleNumber}`" />
            <q-btn flat color="teal" icon="swap_horiz" label="이동 등록" to="/movements" />
        </q-card-actions>
    </q-card>
</template>
