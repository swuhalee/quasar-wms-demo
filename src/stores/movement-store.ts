import { acceptHMRUpdate, defineStore } from "pinia";
import { useQuery, useMutation, useQueryCache } from "@pinia/colada";
import { computed } from "vue";
import { api } from "src/boot/axios";
import type { InventoryAdjustment } from "src/models/InventoryAdjustment";
import type { InventoryMovement } from "src/models/InventoryMovement";

export interface CreateMovementPayload {
    articleNumber: string;
    fromLocationId: number;
    toLocationId: number;
    quantity: number;
}

export interface CreateAdjustmentPayload {
    articleNumber: string;
    locationId: number;
    adjustedQuantity: number;
    reason: string;
}

const MOVEMENT_KEYS = {
    movements: ['movements'] as const,
    adjustments: ['adjustments'] as const,
};

export const useMovementStore = defineStore('movement', () => {
    const queryCache = useQueryCache();

    const { state: movState, refresh: refreshMovements } = useQuery({
        key: MOVEMENT_KEYS.movements,
        query: () => api.get<InventoryMovement[]>('/api/v1/movements').then(r => r.data),
    });

    const { state: adjState, refresh: refreshAdjustments } = useQuery({
        key: MOVEMENT_KEYS.adjustments,
        query: () => api.get<InventoryAdjustment[]>('/api/v1/inventoryAdjustments').then(r => r.data),
    });

    const { mutateAsync: createMovementAsync, state: createMovState } = useMutation({
        mutation: (payload: CreateMovementPayload) =>
            api.post<InventoryMovement>('/api/v1/movements', payload).then(r => r.data),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: MOVEMENT_KEYS.movements });
        },
    });

    const { mutateAsync: createAdjustmentAsync, state: createAdjState } = useMutation({
        mutation: (payload: CreateAdjustmentPayload) =>
            api.post<InventoryAdjustment>('/api/v1/inventoryAdjustments', payload).then(r => r.data),
        onSettled: () => {
            void queryCache.invalidateQueries({ key: MOVEMENT_KEYS.adjustments });
        },
    });

    const movements = computed(() => movState.value.data ?? []);
    const adjustments = computed(() => adjState.value.data ?? []);
    const movementsLoading = computed(() => movState.value.status === 'pending');
    const adjustmentsLoading = computed(() => adjState.value.status === 'pending');
    const createMovementLoading = computed(() => createMovState.value.status === 'pending');
    const createAdjustmentLoading = computed(() => createAdjState.value.status === 'pending');
    const loading = computed(() => movementsLoading.value || adjustmentsLoading.value);

    async function fetchAll() {
        await Promise.all([refreshMovements(), refreshAdjustments()]);
    }

    return {
        movements,
        adjustments,
        movementsLoading,
        adjustmentsLoading,
        createMovementLoading,
        createAdjustmentLoading,
        loading,
        fetchMovements: refreshMovements,
        fetchAdjustments: refreshAdjustments,
        createMovement: createMovementAsync,
        createAdjustment: createAdjustmentAsync,
        fetchAll,
    };
});

if (import.meta.hot) {
    import.meta.hot.accept(acceptHMRUpdate(useMovementStore, import.meta.hot));
}
