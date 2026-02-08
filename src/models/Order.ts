export enum OrderStatusId {
    Created = 100,
    Picked = 400,
    Shipped = 500,
}

export const OrderStatusLabel: Record<OrderStatusId, string> = {
    [OrderStatusId.Created]: 'Created',
    [OrderStatusId.Picked]: 'Picked',
    [OrderStatusId.Shipped]: 'Shipped',
};

export interface OrderLine {
    rowNumber: number;
    articleNumber: string;
    orderedNumberOfItems: number;
    pickedNumberOfItems: number;
}

export interface OrderStatus {
    statusId: OrderStatusId;
    statusText: string;
}

export interface Order {
    orderId: number;
    orderNumber: string;
    goodsOwnerId: number;
    orderStatus: OrderStatus;
    orderLines: OrderLine[];
    orderRemark: string;
    createdDate: string;
}