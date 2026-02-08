import { defineStore, acceptHMRUpdate } from 'pinia';
import { computed } from 'vue';
import { api } from 'boot/axios';
import type { PurchaseOrder } from 'src/models/PurchaseOrder';
import { useMutation, useQuery, useQueryCache } from '@pinia/colada';
import { ARTICLE_KEYS } from './article-store';

export interface CreatePurchaseOrderPayload {
    purchaseOrderNumber: string;
    purchaseOrderLines: {
        rowNumber: number;
        articleNumber: string;
        orderedNumberOfItems: number;
    }[];
    purchaseOrderRemark?: string;
}

const PURCHASE_ORDER_KEYS = {
    list: ['purchase_orders'] as const,
};

export const usePurchaseOrderStore = defineStore('purchaseOrder', () => {
    const queryCache = useQueryCache();

    const { state, refresh, isLoading: fetchLoading } = useQuery({
        key: PURCHASE_ORDER_KEYS.list,
        query: () => api.get<PurchaseOrder[]>('/api/v1/purchaseOrders').then(r => r.data),
    });

    const { mutateAsync: createPurchaseOrderAsync, isLoading: createLoading } = useMutation({
        mutation: (payload: CreatePurchaseOrderPayload) =>
            api.put<PurchaseOrder>('/api/v1/purchaseOrders', payload).then(r => r.data),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ARTICLE_KEYS.list });
            void queryCache.invalidateQueries({ key: PURCHASE_ORDER_KEYS.list });
        },
    });

    const purchaseOrders = computed(() => state.value.data ?? []);

    return {
        purchaseOrders,
        fetchLoading,
        createLoading,
        fetchPurchaseOrders: refresh,
        createPurchaseOrder: createPurchaseOrderAsync,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(usePurchaseOrderStore, import.meta.hot));
}
