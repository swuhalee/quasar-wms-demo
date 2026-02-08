export interface PickingListItem {
    orderLineRowNumber: number;
    articleNumber: string;
    articleName: string;
    locationName: string;
    locationId: number;
    quantityToPick: number;
}

export interface PickingList {
    orderId: number;
    orderNumber: string;
    items: PickingListItem[];
}