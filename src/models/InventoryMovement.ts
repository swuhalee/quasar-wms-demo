export interface InventoryMovement {
    movementId: number;
    articleNumber: string;
    fromLocationId: number;
    toLocationId: number;
    quantity: number;
    movedDate: string;
}