import { useQuery, useMutation, useQueryCache } from '@pinia/colada';
import { computed } from 'vue';
import { movementApi, type CreateMovementPayload, type CreateAdjustmentPayload } from 'src/api/movementApi';

export const MOVEMENT_KEYS = {
    movements: ['movements'] as const,
    adjustments: ['adjustments'] as const,
};

/** 재고 이동 목록 조회 */
export function useMovements() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...MOVEMENT_KEYS.movements],
        query: movementApi.fetchMovements,
    });

    const movements = computed(() => state.value.data ?? []);

    return { movements, isLoading, refresh };
}

/** 재고 조정 목록 조회 */
export function useAdjustments() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...MOVEMENT_KEYS.adjustments],
        query: movementApi.fetchAdjustments,
    });

    const adjustments = computed(() => state.value.data ?? []);

    return { adjustments, isLoading, refresh };
}

/** 재고 이동 생성 */
export function useCreateMovement() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (payload: CreateMovementPayload) => movementApi.createMovement(payload),
        onSuccess: () => {
            void queryCache.invalidateQueries({ key: MOVEMENT_KEYS.movements });
        },
    });

    return { createMovement: mutateAsync, isLoading };
}

/** 재고 조정 생성 */
export function useCreateAdjustment() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (payload: CreateAdjustmentPayload) => movementApi.createAdjustment(payload),
        onSuccess: () => {
            void queryCache.invalidateQueries({ key: MOVEMENT_KEYS.adjustments });
        },
    });

    return { createAdjustment: mutateAsync, isLoading };
}
