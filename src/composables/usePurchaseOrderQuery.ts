import { useQuery, useMutation, useQueryCache } from '@pinia/colada';
import { computed } from 'vue';
import { purchaseOrderApi, type CreatePurchaseOrderPayload } from 'src/api/purchaseOrderApi';
import { ARTICLE_KEYS } from 'src/composables/useArticleQuery';

export const PURCHASE_ORDER_KEYS = {
    list: ['purchase_orders'] as const,
};

/** 입고 주문 목록 조회 */
export function usePurchaseOrders() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...PURCHASE_ORDER_KEYS.list],
        query: purchaseOrderApi.fetchPurchaseOrders,
    });

    const purchaseOrders = computed(() => state.value.data ?? []);

    return { purchaseOrders, isLoading, refresh };
}

/** 입고 주문 생성 */
export function useCreatePurchaseOrder() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (payload: CreatePurchaseOrderPayload) => purchaseOrderApi.createPurchaseOrder(payload),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ARTICLE_KEYS.list });
            void queryCache.invalidateQueries({ key: PURCHASE_ORDER_KEYS.list });
        },
    });

    return { createPurchaseOrder: mutateAsync, isLoading };
}
