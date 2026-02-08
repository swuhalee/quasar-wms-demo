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

    const { state, refresh } = useQuery({
        key: ORDER_KEYS.list,
        query: () => api.get<Order[]>('/api/v1/orders').then(r => r.data),
    });

    const { mutateAsync: createOrderAsync, state: createState } = useMutation({
        mutation: (payload: CreateOrderPayload) =>
            api.put<Order>('/api/v1/orders', payload).then(r => r.data),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ORDER_KEYS.list });
        },
    });

    const { mutateAsync: processOrderAsync, state: processState } = useMutation({
        mutation: (orderId: number) =>
            api.post<Order>(`/api/v1/orders/${orderId}/process`).then(r => r.data),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: ORDER_KEYS.list });
        },
    });

    const orders = computed(() => state.value.data ?? []);
    const fetchLoading = computed(() => state.value.status === 'pending');
    const createLoading = computed(() => createState.value.status === 'pending');
    const processLoading = computed(() => processState.value.status === 'pending');

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
