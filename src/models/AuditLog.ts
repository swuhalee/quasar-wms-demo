export enum AuditAction {
    PurchaseOrderReceived = 'PO_RECEIVED',
    OrderCreated = 'ORDER_CREATED',
    OrderPicked = 'ORDER_PICKED',
    OrderShipped = 'ORDER_SHIPPED',
    StockMoved = 'STOCK_MOVED',
    StockAdjusted = 'STOCK_ADJUSTED',
    ReturnReceived = 'RETURN_RECEIVED',
    ReturnInspected = 'RETURN_INSPECTED',
    ReturnRestocked = 'RETURN_RESTOCKED',
    ReturnDamaged = 'RETURN_DAMAGED',
    WebhookProcessed = 'WEBHOOK_PROCESSED',
}

export interface AuditLogEntry {
    auditId: number;
    timestamp: string;
    action: AuditAction;
    articleNumber: string | null;
    referenceType:
    | 'order'
    | 'purchaseOrder'
    | 'returnOrder'
    | 'movement'
    | 'adjustment'
    | 'webhook';
    referenceId: number;
    description: string;
    details: Record<string, string | number | null>;
}