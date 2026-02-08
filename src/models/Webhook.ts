export enum WebhookEventType {
    CarrierStatusUpdate = 'CARRIER_STATUS_UPDATE',
    SupplierShipmentNotice = 'SUPPLIER_SHIPMENT_NOTICE',
    ExternalInventorySync = 'EXTERNAL_INVENTORY_SYNC',
    ReturnInitiated = 'RETURN_INITIATED',
}

export const WebhookEventTypeLabel: Record<WebhookEventType, string> = {
    [WebhookEventType.CarrierStatusUpdate]: 'Carrier Status Update',
    [WebhookEventType.SupplierShipmentNotice]: 'Supplier Shipment Notice',
    [WebhookEventType.ExternalInventorySync]: 'External Inventory Sync',
    [WebhookEventType.ReturnInitiated]: 'Return Initiated',
};

export interface WebhookEvent {
    eventId: number;
    eventType: WebhookEventType;
    payload: Record<string, unknown>;
    receivedDate: string;
    processed: boolean;
    resultMessage: string;
}