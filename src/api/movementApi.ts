import { api } from 'src/boot/axios';
import type { InventoryAdjustment } from 'src/models/InventoryAdjustment';
import type { InventoryMovement } from 'src/models/InventoryMovement';

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

export const movementApi = {
    fetchMovements: () =>
        api.get<InventoryMovement[]>('/api/v1/movements').then((r) => r.data),

    fetchAdjustments: () =>
        api.get<InventoryAdjustment[]>('/api/v1/inventoryAdjustments').then((r) => r.data),

    createMovement: (payload: CreateMovementPayload) =>
        api.post<InventoryMovement>('/api/v1/movements', payload).then((r) => r.data),

    createAdjustment: (payload: CreateAdjustmentPayload) =>
        api.post<InventoryAdjustment>('/api/v1/inventoryAdjustments', payload).then((r) => r.data),
};
