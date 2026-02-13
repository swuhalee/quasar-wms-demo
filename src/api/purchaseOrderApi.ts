import { api } from 'src/boot/axios';
import type { PurchaseOrder } from 'src/models/PurchaseOrder';

export interface CreatePurchaseOrderPayload {
    purchaseOrderNumber: string;
    purchaseOrderLines: {
        rowNumber: number;
        articleNumber: string;
        orderedNumberOfItems: number;
    }[];
    purchaseOrderRemark?: string;
}

export const purchaseOrderApi = {
    fetchPurchaseOrders: () =>
        api.get<PurchaseOrder[]>('/api/v1/purchaseOrders').then((r) => r.data),

    createPurchaseOrder: (payload: CreatePurchaseOrderPayload) =>
        api.post<PurchaseOrder>('/api/v1/purchaseOrders', payload).then((r) => r.data),
};
