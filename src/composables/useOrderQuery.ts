import { useQuery, useMutation, useQueryCache } from '@pinia/colada';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { orderApi, type CreateOrderPayload } from 'src/api/orderApi';
import { ARTICLE_KEYS } from 'src/composables/useArticleQuery';

export const ORDER_KEYS = {
    list: ['orders'] as const,
    pickingList: (id: number) => ['orders', id, 'pickingList'] as const,
};

/** 주문 전체 목록 조회 */
export function useOrders() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...ORDER_KEYS.list],
        query: orderApi.fetchOrders,
    });

    const orders = computed(() => state.value.data ?? []);

    return { orders, isLoading, refresh };
}

/** 특정 주문의 픽 리스트 조회 */
export function usePickingList(orderId: MaybeRefOrGetter<number | null>) {
    const { state, isLoading } = useQuery({
        key: () => {
            const id = toValue(orderId);
            return id !== null
                ? [...ORDER_KEYS.pickingList(id)]
                : ['orders', 'pickingList', 'empty'];
        },
        query: () => {
            const id = toValue(orderId);
            if (id === null) return Promise.resolve(null);
            return orderApi.fetchPickingList(id);
        },
    });

    const pickingList = computed(() => state.value.data ?? null);

    return { pickingList, isLoading };
}

/** 주문 생성 */
export function useCreateOrder() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (payload: CreateOrderPayload) => orderApi.createOrder(payload),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ORDER_KEYS.list });
        },
    });

    return { createOrder: mutateAsync, isLoading };
}

/** 주문 처리 (상태 전이: Created → Picked → Shipped) */
export function useProcessOrder() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (orderId: number) => orderApi.processOrder(orderId),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ORDER_KEYS.list });
            void queryCache.invalidateQueries({ key: ARTICLE_KEYS.list });
        },
    });

    return { processOrder: mutateAsync, isLoading };
}
