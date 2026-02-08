export interface PurchaseOrderLine {
    rowNumber: number;
    articleNumber: string;
    orderedNumberOfItems: number;
}

export interface PurchaseOrder {
    purchaseOrderId: number;
    purchaseOrderNumber: string;
    goodsOwnerId: number;
    purchaseOrderLines: PurchaseOrderLine[];
    purchaseOrderRemark: string;
    inDate: string;
}