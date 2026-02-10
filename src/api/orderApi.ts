import { api } from 'src/boot/axios';
import type { Order } from 'src/models/Order';
import type { PickingList } from 'src/models/PickingList';

export interface CreateOrderPayload {
    orderNumber: string;
    orderLines: {
        rowNumber: number;
        articleNumber: string;
        orderedNumberOfItems: number;
    }[];
    orderRemark?: string;
}

export const orderApi = {
    fetchOrders: () =>
        api.get<Order[]>('/api/v1/orders').then((r) => r.data),

    fetchPickingList: (orderId: number) =>
        api.get<PickingList>(`/api/v1/orders/${orderId}/pickingList`).then((r) => r.data),

    createOrder: (payload: CreateOrderPayload) =>
        api.put<Order>('/api/v1/orders', payload).then((r) => r.data),

    processOrder: (orderId: number) =>
        api.post<Order>(`/api/v1/orders/${orderId}/process`).then((r) => r.data),
};
