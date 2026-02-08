import { acceptHMRUpdate, defineStore } from "pinia";
import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import { api } from "src/boot/axios";
import type { Order } from "src/models/Order";

export interface CreateOrderPayload {
    orderName: string;
    orderLines: {
        rowNumber: number;
        articleNumber: string;
        orderedNumberOfItems: number;
    }[];
    orderRemark?: string;
}

const ORDER_KEYS = {
    list: ['orders'] as const,
};

export const useOrderStore = defineStore('order', () => {
    const queryCache = useQueryCache();

    const { state, refresh, isLoading: fetchLoading } = useQuery({
        key: ORDER_KEYS.list,
        query: () => api.get<Order[]>('/api/v1/orders').then(r => r.data),
    });

    const { mutateAsync: createOrderAsync, isLoading: createLoading } = useMutation({
        mutation: (payload: CreateOrderPayload) =>
            api.put<Order>('/api/v1/orders', payload).then(r => r.data),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ORDER_KEYS.list });
        },
    });

    const { mutateAsync: processOrderAsync, isLoading: processLoading } = useMutation({
        mutation: (orderId: number) =>
            api.post<Order>(`/api/v1/orders/${orderId}/process`).then(r => r.data),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ORDER_KEYS.list });
        },
    });

    const orders = computed(() => state.value.data ?? []);

    return {
        orders,
        fetchLoading,
        createLoading,
        processLoading,
        fetchOrders: refresh,
        createOrder: createOrderAsync,
        processOrder: processOrderAsync,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useOrderStore, import.meta.hot));
}
