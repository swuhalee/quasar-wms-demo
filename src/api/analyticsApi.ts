import { api } from "src/boot/axios";
import type { AbcAnalysisItem, InventoryTrends, LowStockAlert, WarehousePerformance } from "src/models/Analytics";

export const analyticsApi = {
    fetchAbcAnalysis: () =>
        api.get<AbcAnalysisItem[]>('/api/v1/analytics/abcAnalysis').then((r) => r.data),

    fetchPerformance: () =>
        api.get<WarehousePerformance>('/api/v1/analytics/performance').then((r) => r.data),

    fetchLowStockAlerts: () =>
        api.get<LowStockAlert[]>('/api/v1/analytics/lowStockAlerts').then((r) => r.data),

    fetchInventoryTrends: () =>
        api.get<InventoryTrends>('/api/v1/analytics/inventoryTrends').then((r) => r.data),
};
