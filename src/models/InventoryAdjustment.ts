export interface InventoryAdjustment {
    adjustmentId: number;
    articleNumber: string;
    locationId: number;
    adjustedQuantity: number; // positive = increase, negative = decrease
    reason: string;
    adjustedDate: string;
}