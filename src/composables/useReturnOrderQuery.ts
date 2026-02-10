import { useQuery, useMutation, useQueryCache } from '@pinia/colada';
import { computed } from 'vue';
import {
    returnOrderApi,
    type CreateReturnOrderPayload,
    type ProcessReturnPayload,
} from 'src/api/returnOrderApi';

export const RETURN_ORDER_KEYS = {
    list: ['returnOrders'] as const,
    causeSummary: ['returnOrders', 'causeSummary'] as const,
};

/** 반품 목록 조회 */
export function useReturnOrders() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...RETURN_ORDER_KEYS.list],
        query: returnOrderApi.fetchReturnOrders,
    });

    const returnOrders = computed(() => state.value.data ?? []);

    return { returnOrders, isLoading, refresh };
}

/** 반품 원인 요약 조회 */
export function useReturnCauseSummary() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...RETURN_ORDER_KEYS.causeSummary],
        query: returnOrderApi.fetchCauseSummary,
    });

    const causeSummary = computed(() => state.value.data ?? []);

    return { causeSummary, isLoading, refresh };
}

/** 반품 생성 */
export function useCreateReturnOrder() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (payload: CreateReturnOrderPayload) => returnOrderApi.createReturnOrder(payload),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: RETURN_ORDER_KEYS.list });
            void queryCache.invalidateQueries({ key: RETURN_ORDER_KEYS.causeSummary });
        },
    });

    return { createReturnOrder: mutateAsync, isLoading };
}

/** 반품 검수 */
export function useInspectReturnOrder() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (returnOrderId: number) => returnOrderApi.inspectReturnOrder(returnOrderId),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: RETURN_ORDER_KEYS.list });
            void queryCache.invalidateQueries({ key: RETURN_ORDER_KEYS.causeSummary });
        },
    });

    return { inspectReturnOrder: mutateAsync, isLoading };
}

/** 반품 처리 (disposition 결정) */
export function useProcessReturnOrder() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: ({ returnOrderId, payload }: { returnOrderId: number; payload: ProcessReturnPayload }) =>
            returnOrderApi.processReturnOrder(returnOrderId, payload),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: RETURN_ORDER_KEYS.list });
            void queryCache.invalidateQueries({ key: RETURN_ORDER_KEYS.causeSummary });
        },
    });

    return { processReturnOrder: mutateAsync, isLoading };
}
