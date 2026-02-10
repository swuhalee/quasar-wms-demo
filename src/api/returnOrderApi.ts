import { api } from 'src/boot/axios';
import type { ReturnCause, ReturnOrder } from 'src/models/ReturnOrder';

export interface CreateReturnOrderPayload {
    returnOrderNumber: string;
    originalOrderNumber: string;
    returnLines: {
        rowNumber: number;
        articleNumber: string;
        returnedNumberOfItems: number;
        cause: ReturnCause;
    }[];
    returnRemark?: string;
}

export interface ProcessReturnPayload {
    lineDispositions: {
        rowNumber: number;
        disposition: 'restock' | 'damaged';
        inspectionNote: string;
    }[];
}

export const returnOrderApi = {
    fetchReturnOrders: () =>
        api.get<ReturnOrder[]>('/api/v1/returnOrders').then((r) => r.data),

    fetchCauseSummary: () =>
        api.get<{ cause: string; causeLabel: string; count: number }[]>(
            '/api/v1/returnOrders/causeSummary',
        ).then((r) => r.data),

    createReturnOrder: (payload: CreateReturnOrderPayload) =>
        api.post<ReturnOrder>('/api/v1/returnOrders', payload).then((r) => r.data),

    inspectReturnOrder: (returnOrderId: number) =>
        api.post<ReturnOrder>(`/api/v1/returnOrders/${returnOrderId}/inspect`).then((r) => r.data),

    processReturnOrder: (returnOrderId: number, payload: ProcessReturnPayload) =>
        api.post<ReturnOrder>(`/api/v1/returnOrders/${returnOrderId}/process`, payload).then((r) => r.data),
};
