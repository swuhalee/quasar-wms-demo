import { http, HttpResponse } from 'msw';
import { appendAuditLog, BASE, findArticle, findLocation, recalcArticleTotals } from '../helper';
import { db, saveToStorage } from '../data/db';
import type { WebhookEvent } from 'src/models/Webhook';
import { WebhookEventType } from 'src/models/Webhook';
import { OrderStatusId, OrderStatusLabel } from 'src/models/Order';
import { AuditAction } from 'src/models/AuditLog';
import type { ReturnOrder } from 'src/models/ReturnOrder';
import { ReturnCause, ReturnStatusId, ReturnStatusLabel } from 'src/models/ReturnOrder';

const getWebhookEvents = http.get(`${BASE}/webhooks`, () => {
    return HttpResponse.json(db.webhookEvents);
});

interface SimulateWebhookBody {
    eventType: WebhookEventType;
    payload: Record<string, string | number | null>;
}

const simulateWebhook = http.post(`${BASE}/webhooks/simulate`, async ({ request }) => {
    const body = (await request.json()) as SimulateWebhookBody;
    let resultMessage = '';

    try {
        switch (body.eventType) {
            case WebhookEventType.CarrierStatusUpdate: {
                const orderNumber = body.payload['orderNumber'] as string;
                const order = db.orders.find((o) => o.orderNumber === orderNumber);
                if (!order) throw new Error(`Order ${orderNumber} not found`);
                if (order.orderStatus.statusId !== OrderStatusId.Picked) {
                    throw new Error(`Order ${orderNumber} is not in Picked status`);
                }
                order.orderStatus = {
                    statusId: OrderStatusId.Shipped,
                    statusText: OrderStatusLabel[OrderStatusId.Shipped],
                };
                for (const line of order.orderLines) {
                    appendAuditLog(
                        AuditAction.OrderShipped,
                        line.articleNumber,
                        'order',
                        order.orderId,
                        `Webhook: carrier updated ${orderNumber} to Shipped`,
                        { orderNumber, via: 'webhook' },
                    );
                }
                resultMessage = `Order ${orderNumber} advanced to Shipped`;
                break;
            }

            case WebhookEventType.SupplierShipmentNotice: {
                const articleNumber = body.payload['articleNumber'] as string;
                const quantity = body.payload['quantity'] as number;
                const article = findArticle(articleNumber);
                if (!article) throw new Error(`Article ${articleNumber} not found`);
                // Add to RCV-01
                const existing = db.articleItemLocations.find(
                    (r) => r.articleNumber === articleNumber && r.locationId === 1,
                );
                if (existing) {
                    existing.quantity += quantity;
                } else {
                    db.articleItemLocations.push({
                        articleNumber,
                        locationId: 1,
                        quantity,
                        allocatedQuantity: 0,
                    });
                }
                recalcArticleTotals(articleNumber);
                appendAuditLog(
                    AuditAction.PurchaseOrderReceived,
                    articleNumber,
                    'webhook',
                    0,
                    `Webhook: supplier shipment ${quantity}x ${articleNumber} received at RCV-01`,
                    { articleNumber, quantity, via: 'webhook' },
                );
                resultMessage = `Received ${quantity}x ${articleNumber} at RCV-01`;
                break;
            }

            case WebhookEventType.ExternalInventorySync: {
                const articleNumber = body.payload['articleNumber'] as string;
                const locationId = body.payload['locationId'] as number;
                const newQuantity = body.payload['newQuantity'] as number;
                const article = findArticle(articleNumber);
                if (!article) throw new Error(`Article ${articleNumber} not found`);
                if (!findLocation(locationId)) throw new Error(`Location ${locationId} not found`);

                const row = db.articleItemLocations.find(
                    (r) => r.articleNumber === articleNumber && r.locationId === locationId,
                );
                const oldQty = row?.quantity ?? 0;
                const delta = newQuantity - oldQty;
                if (row) {
                    row.quantity = newQuantity;
                } else if (newQuantity > 0) {
                    db.articleItemLocations.push({
                        articleNumber,
                        locationId,
                        quantity: newQuantity,
                        allocatedQuantity: 0,
                    });
                }
                recalcArticleTotals(articleNumber);
                appendAuditLog(
                    AuditAction.StockAdjusted,
                    articleNumber,
                    'webhook',
                    0,
                    `Webhook: synced ${articleNumber} at location ${locationId} from ${oldQty} to ${newQuantity} (delta: ${delta > 0 ? '+' : ''}${delta})`,
                    { articleNumber, locationId, oldQty, newQuantity, via: 'webhook' },
                );
                resultMessage = `Synced ${articleNumber}: ${oldQty} → ${newQuantity}`;
                break;
            }

            case WebhookEventType.ReturnInitiated: {
                const orderNumber = body.payload['orderNumber'] as string;
                const articleNumber = body.payload['articleNumber'] as string;
                const quantity = body.payload['quantity'] as number;
                const cause = (body.payload['cause'] as ReturnCause) ?? ReturnCause.Other;

                const order = db.orders.find((o) => o.orderNumber === orderNumber);
                if (!order) throw new Error(`Order ${orderNumber} not found`);
                if (!findArticle(articleNumber)) throw new Error(`Article ${articleNumber} not found`);

                const ret: ReturnOrder = {
                    returnOrderId: db.nextReturnOrderId++,
                    returnOrderNumber: `RET-WH-${Date.now()}`,
                    originalOrderNumber: orderNumber,
                    goodsOwnerId: 1,
                    returnStatus: {
                        statusId: ReturnStatusId.Received,
                        statusText: ReturnStatusLabel[ReturnStatusId.Received],
                    },
                    returnLines: [
                        {
                            rowNumber: 1,
                            articleNumber,
                            returnedNumberOfItems: quantity,
                            cause,
                            inspectionNote: '',
                            disposition: 'pending',
                        },
                    ],
                    returnRemark: 'Auto-created via webhook',
                    createdDate: new Date().toISOString(),
                    processedDate: null,
                };
                db.returnOrders.push(ret);
                appendAuditLog(
                    AuditAction.ReturnReceived,
                    articleNumber,
                    'returnOrder',
                    ret.returnOrderId,
                    `Webhook: return initiated for ${quantity}x ${articleNumber} from ${orderNumber}`,
                    { orderNumber, articleNumber, quantity, cause, via: 'webhook' },
                );
                resultMessage = `Return ${ret.returnOrderNumber} created for ${quantity}x ${articleNumber}`;
                break;
            }

            default:
                throw new Error('Unknown event type');
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        const event: WebhookEvent = {
            eventId: db.nextWebhookEventId++,
            eventType: body.eventType,
            payload: body.payload,
            receivedDate: new Date().toISOString(),
            processed: false,
            resultMessage: msg,
        };
        db.webhookEvents.push(event);
        saveToStorage();
        return HttpResponse.json({ message: msg }, { status: 400 });
    }

    const event: WebhookEvent = {
        eventId: db.nextWebhookEventId++,
        eventType: body.eventType,
        payload: body.payload,
        receivedDate: new Date().toISOString(),
        processed: true,
        resultMessage,
    };
    db.webhookEvents.push(event);

    appendAuditLog(
        AuditAction.WebhookProcessed,
        null,
        'webhook',
        event.eventId,
        `Webhook ${body.eventType} processed: ${resultMessage}`,
        { eventType: body.eventType },
    );

    saveToStorage();
    return HttpResponse.json(event, { status: 200 });
});

export const webhooksHandlers = [
    getWebhookEvents,
    simulateWebhook
];
