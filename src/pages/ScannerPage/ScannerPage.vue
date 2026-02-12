<script setup lang="ts">
import { useScanBarcode } from 'src/composables/useScanQuery';
import { computed, ref } from 'vue';
import ArticleResult from './components/ArticleResult.vue';
import LocationResult from './components/LocationResult.vue';

const barcodeInput = ref('');
const confirmedBarcode = ref('');

const { state, recentScans, isLoading } = useScanBarcode(() => confirmedBarcode.value);

const result = computed(() => state.value.data ?? null);

function scan() {
    const code = barcodeInput.value.trim();
    if (!code) return;
    confirmedBarcode.value = code;
}

function clear() {
    barcodeInput.value = '';
    confirmedBarcode.value = '';
}
</script>

<template>
    <q-page padding>
        <div class="text-h5 q-mb-lg">바코드 스캐너</div>

        <q-card flat bordered class="q-mb-lg">
            <q-card-section>
                <q-input v-model="barcodeInput" label="바코드 / SKU / 로케이션 스캔 또는 입력" outlined autofocus
                    class="pda-large-input" @keyup.enter="scan">
                    <template v-slot:prepend>
                        <q-icon name="qr_code_scanner" size="md" />
                    </template>
                    <template v-slot:append>
                        <q-btn flat round icon="search" color="primary" @click="scan" />
                        <q-btn v-if="barcodeInput" flat round icon="close" @click="clear" />
                    </template>
                </q-input>
            </q-card-section>
        </q-card>

        <div v-if="isLoading" class="text-center q-pa-lg">
            <q-spinner size="48px" color="primary" />
        </div>

        <div v-else-if="result">
            <ArticleResult v-if="result.type === 'article'" :result="result" />
            <LocationResult v-else-if="result.type === 'location'" :result="result" />
        </div>

        <q-banner v-else-if="confirmedBarcode" class="bg-warning text-white q-mb-lg" rounded>
            <q-icon name="warning" class="q-mr-sm" />"{{ barcodeInput }}"에 해당하는 품목 또는 로케이션이 없습니다
        </q-banner>

        <q-card v-if="recentScans.length > 0" flat bordered>
            <q-card-section>
                <div class="text-subtitle1 text-weight-bold q-mb-sm">최근 스캔</div>
                <q-list>
                    <q-item v-for="(s, i) in recentScans" :key="i" clickable @click="barcodeInput = s.barcode; scan()"
                        class="q-my-sm bg-grey-1">
                        <q-item-section avatar>
                            <q-icon
                                :name="s.type === 'article' ? 'inventory_2' : s.type === 'location' ? 'place' : 'close'"
                                :color="s.type === 'not_found' ? 'negative' : 'primary'" />
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ s.barcode }}</q-item-label>
                            <q-item-label caption>{{ s.type === 'not_found' ? '미발견' : s.label }} — {{ s.time
                            }}</q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
    </q-page>
</template>
