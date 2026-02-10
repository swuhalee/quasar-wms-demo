import { useQuery } from '@pinia/colada';
import { computed } from 'vue';
import { warehouseApi } from 'src/api/warehouseApi';

export const WAREHOUSE_KEYS = {
    warehouses: ['warehouse', 'warehouses'] as const,
    zones: ['warehouse', 'zones'] as const,
    locations: ['warehouse', 'locations'] as const,
    articleItemLocations: ['warehouse', 'articleItemLocations'] as const,
};

/** 창고 목록 조회 */
export function useWarehouses() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...WAREHOUSE_KEYS.warehouses],
        query: warehouseApi.fetchWarehouses,
    });

    const warehouses = computed(() => state.value.data ?? []);

    return { warehouses, isLoading, refresh };
}

/** 구역(Zone) 목록 조회 */
export function useZones() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...WAREHOUSE_KEYS.zones],
        query: warehouseApi.fetchZones,
    });

    const zones = computed(() => state.value.data ?? []);

    return { zones, isLoading, refresh };
}

/** 로케이션 목록 조회 */
export function useLocations() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...WAREHOUSE_KEYS.locations],
        query: warehouseApi.fetchLocations,
    });

    const locations = computed(() => state.value.data ?? []);

    return { locations, isLoading, refresh };
}

/** 품목-로케이션 매핑 조회 */
export function useArticleItemLocations() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...WAREHOUSE_KEYS.articleItemLocations],
        query: warehouseApi.fetchArticleItemLocations,
    });

    const articleItemLocations = computed(() => state.value.data ?? []);

    return { articleItemLocations, isLoading, refresh };
}
