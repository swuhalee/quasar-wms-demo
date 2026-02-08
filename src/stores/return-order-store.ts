import { acceptHMRUpdate, defineStore } from "pinia";
import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import { api } from "src/boot/axios";
import type { ReturnCause, ReturnOrder } from "src/models/ReturnOrder";

export interface CreateReturnOrderPayload {
    returnOrderNumber: string;
    originalOrderNumber: string;
    returnLines: {
        rowNumber: number;
        articleNumber: string;
        returnedNumberOfItems: number;
        cause: ReturnCause;
    }[];
    returnRemark?: string;
}

export interface ProcessReturnPayload {
    lineDispositions: {
        rowNumber: number;
        disposition: 'restock' | 'damaged';
        inspectionNote: string;
    }[];
}

const RETURN_KEYS = {
    list: ['returnOrders'] as const,
    causeSummary: ['returnOrders', 'causeSummary'] as const,
};

export const useReturnOrderStore = defineStore('returnOrder', () => {
    const queryCache = useQueryCache();

    const { state, refresh: refreshReturnOrders, isLoading: fetchLoading } = useQuery({
        key: RETURN_KEYS.list,
        query: () => api.get<ReturnOrder[]>('/api/v1/returnOrders').then(r => r.data),
    });

    const { state: causeState, refresh: refreshCauseSummary } = useQuery({
        key: RETURN_KEYS.causeSummary,
        query: () => api.get<{ cause: string; causeLabel: string; count: number }[]>(
            '/api/v1/returnOrders/causeSummary',
        ).then(r => r.data),
    });

    const invalidateAll = () => {
        void queryCache.invalidateQueries({ key: RETURN_KEYS.list });
        void queryCache.invalidateQueries({ key: RETURN_KEYS.causeSummary });
    };

    const { mutateAsync: createReturnOrderAsync, isLoading: createLoading } = useMutation({
        mutation: (payload: CreateReturnOrderPayload) =>
            api.post<ReturnOrder>('/api/v1/returnOrders', payload).then(r => r.data),
        onSettled: invalidateAll,
    });

    const { mutateAsync: inspectReturnOrderAsync, isLoading: inspectLoading } = useMutation({
        mutation: (returnOrderId: number) =>
            api.post<ReturnOrder>(`/api/v1/returnOrders/${returnOrderId}/inspect`).then(r => r.data),
        onSettled: invalidateAll,
    });

    const { mutateAsync: processReturnOrderAsync, isLoading: processLoading } = useMutation({
        mutation: ({ returnOrderId, payload }: { returnOrderId: number; payload: ProcessReturnPayload }) =>
            api.post<ReturnOrder>(`/api/v1/returnOrders/${returnOrderId}/process`, payload).then(r => r.data),
        onSettled: invalidateAll,
    });

    const returnOrders = computed(() => state.value.data ?? []);
    const causeSummary = computed(() => causeState.value.data ?? []);
    const loading = computed(() =>
        fetchLoading.value || createLoading.value || inspectLoading.value || processLoading.value,
    );

    async function processReturnOrder(returnOrderId: number, payload: ProcessReturnPayload) {
        return processReturnOrderAsync({ returnOrderId, payload });
    }

    return {
        returnOrders,
        causeSummary,
        fetchLoading,
        createLoading,
        inspectLoading,
        processLoading,
        loading,
        fetchReturnOrders: refreshReturnOrders,
        createReturnOrder: createReturnOrderAsync,
        inspectReturnOrder: inspectReturnOrderAsync,
        processReturnOrder,
        fetchCauseSummary: refreshCauseSummary,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useReturnOrderStore, import.meta.hot));
}
