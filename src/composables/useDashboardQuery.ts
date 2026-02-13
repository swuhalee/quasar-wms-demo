import { useQuery } from '@pinia/colada';
import { dashboardApi } from 'src/api/dashboardApi';
import type { DashboardSummary } from 'src/models/Dashboard';
import { computed } from 'vue';

export const DASHBOARD_KEYS = {
    summary: ['dashboard', 'summary'] as const,
};

const DEFAULT_SUMMARY: DashboardSummary = {
    totalArticles: 0,
    totalStock: 0,
    sellableStock: 0,
    ordersToday: 0,
    zoneCount: 0,
    locationCount: 0,
    totalAllocated: 0,
    movementsToday: 0,
    returnsToday: 0,
    recentOrders: [],
    lowStockArticles: [],
};

/** 대시보드 요약 조회 (단일 API로 모든 KPI + 최근 주문 + 재고 부족 제공) */
export function useDashboardSummary() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...DASHBOARD_KEYS.summary],
        query: dashboardApi.fetchSummary,
    });

    const summary = computed<DashboardSummary>(() => state.value.data ?? DEFAULT_SUMMARY);

    return { summary, isLoading, refresh };
}
