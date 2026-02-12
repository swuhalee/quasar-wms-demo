import { useQuery } from '@pinia/colada';
import { analyticsApi } from 'src/api/analyticsApi';
import type { InventoryTrends, WarehousePerformance } from 'src/models/Analytics';
import { computed } from 'vue';

export const ANALYTICS_KEYS = {
    abcAnalysis: ['abc-analysis'] as const,
    performance: ['performance'] as const,
    lowStockAlerts: ['low-stock-alerts'] as const,
    inventoryTrends: ['inventory-trends'] as const,
};

/** abc 분석 목록 조회 */
export function useAbcAnalysis() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...ANALYTICS_KEYS.abcAnalysis],
        query: analyticsApi.fetchAbcAnalysis,
    });

    const analysis = computed(() => state.value.data ?? []);

    return { analysis, isLoading, refresh };
}

/** 퍼포먼스 목록 조회 */
export function usePerformance() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...ANALYTICS_KEYS.performance],
        query: analyticsApi.fetchPerformance,
    });

    const performances = computed<WarehousePerformance>(() => state.value.data ?? {
        ordersProcessedToday: 0, ordersCreatedToday: 0, ordersShippedToday: 0,
        averagePickingSpeed: 0, pickingEfficiency: 0, movementsToday: 0, adjustmentsToday: 0,
    });

    return { performances, isLoading, refresh };
}

/** 재고 부족 알림 목록 조회 */
export function useLowStockAlerts() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...ANALYTICS_KEYS.lowStockAlerts],
        query: analyticsApi.fetchLowStockAlerts,
    });

    const alerts = computed(() => state.value.data ?? []);

    return { alerts, isLoading, refresh };
}

/** 재고 추이 조회 */
export function useInventoryTrends() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...ANALYTICS_KEYS.inventoryTrends],
        query: analyticsApi.fetchInventoryTrends,
    });

    const trends = computed<InventoryTrends>(() => state.value.data ?? {
        dates: [], totalInventory: [], sellableInventory: [],
    });

    return { trends, isLoading, refresh };
}
