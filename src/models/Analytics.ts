export type AbcCategory = 'A' | 'B' | 'C';

export interface AbcAnalysisItem {
    articleNumber: string;
    articleName: string;
    totalMovementQuantity: number;
    orderLineQuantity: number;
    category: AbcCategory;
}

export interface WarehousePerformance {
    ordersProcessedToday: number;
    ordersCreatedToday: number;
    ordersShippedToday: number;
    averagePickingSpeed: number;
    pickingEfficiency: number;
    movementsToday: number;
    adjustmentsToday: number;
}

export interface LowStockAlert {
    articleNumber: string;
    articleName: string;
    currentSellable: number;
    reorderPoint: number;
    deficit: number;
}