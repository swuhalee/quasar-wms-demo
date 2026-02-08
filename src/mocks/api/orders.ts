import { http, HttpResponse } from 'msw';
import { appendAuditLog, BASE, findArticle, findLocation, locationsForArticle, recalcArticleTotals } from '../helper';
import { db, saveToStorage } from '../data/db';
import type { Order } from 'src/models/Order';
import { OrderStatusId, OrderStatusLabel } from 'src/models/Order';
import { AuditAction } from 'src/models/AuditLog';

const getOrders = http.get(`${BASE}/orders`, () => {
    return HttpResponse.json(db.orders);
});

interface PutOrderBody {
    orderNumber: string;
    goodsOwnerId?: number;
    orderLines: { rowNumber: number; articleNumber: string; orderedNumberOfItems: number }[];
    orderRemark?: string;
}

const putOrder = http.put(`${BASE}/orders`, async ({ request }) => {
    const body = (await request.json()) as PutOrderBody;

    for (const line of body.orderLines) {
        const article = findArticle(line.articleNumber);
        if (!article) {
            return HttpResponse.json(
                { message: `Article ${line.articleNumber} not found` },
                { status: 400 },
            );
        }
        if (article.inventoryInfo.sellableNumberOfItems < line.orderedNumberOfItems) {
            return HttpResponse.json(
                {
                    message: `Insufficient available stock for ${line.articleNumber}. Available: ${article.inventoryInfo.sellableNumberOfItems}, Requested: ${line.orderedNumberOfItems}`,
                },
                { status: 400 },
            );
        }
    }

    for (const line of body.orderLines) {
        let remaining = line.orderedNumberOfItems;
        const rows = locationsForArticle(line.articleNumber).sort((a, b) => {
            const zoneA = findLocation(a.locationId)?.zoneId ?? 99;
            const zoneB = findLocation(b.locationId)?.zoneId ?? 99;
            if (zoneA === 3 && zoneB !== 3) return -1;
            if (zoneB === 3 && zoneA !== 3) return 1;
            return 0;
        });

        for (const row of rows) {
            if (remaining <= 0) break;
            const avail = row.quantity - row.allocatedQuantity;
            if (avail <= 0) continue;
            const take = Math.min(avail, remaining);
            row.allocatedQuantity += take;
            remaining -= take;
        }
        recalcArticleTotals(line.articleNumber);
    }

    const order: Order = {
        orderId: db.nextOrderId++,
        orderNumber: body.orderNumber,
        goodsOwnerId: body.goodsOwnerId ?? 1,
        orderStatus: {
            statusId: OrderStatusId.Created,
            statusText: OrderStatusLabel[OrderStatusId.Created],
        },
        orderLines: body.orderLines.map((l) => ({
            ...l,
            pickedNumberOfItems: 0,
        })),
        orderRemark: body.orderRemark ?? '',
        createdDate: new Date().toISOString(),
    };

    db.orders.push(order);

    // Audit
    for (const line of order.orderLines) {
        appendAuditLog(
            AuditAction.OrderCreated,
            line.articleNumber,
            'order',
            order.orderId,
            `Order ${order.orderNumber}: allocated ${line.orderedNumberOfItems}x ${line.articleNumber}`,
            { orderNumber: order.orderNumber },
        );
    }

    saveToStorage();
    return HttpResponse.json(order, { status: 200 });
});

const processOrder = http.post(`${BASE}/orders/:orderId/process`, ({ params }) => {
    const id = Number(params['orderId']);
    const order = db.orders.find((o) => o.orderId === id);
    if (!order) {
        return HttpResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.orderStatus.statusId;
    let nextStatus: OrderStatusId | null = null;

    if (currentStatus === OrderStatusId.Created) {
        nextStatus = OrderStatusId.Picked;
        for (const line of order.orderLines) {
            line.pickedNumberOfItems = line.orderedNumberOfItems;
            let remaining = line.orderedNumberOfItems;

            const rows = locationsForArticle(line.articleNumber).sort((a, b) => {
                const zoneA = findLocation(a.locationId)?.zoneId ?? 99;
                const zoneB = findLocation(b.locationId)?.zoneId ?? 99;
                if (zoneA === 3 && zoneB !== 3) return -1;
                if (zoneB === 3 && zoneA !== 3) return 1;
                return 0;
            });

            for (const row of rows) {
                if (remaining <= 0) break;
                const allocated = Math.min(row.allocatedQuantity, remaining);
                if (allocated <= 0) continue;
                row.allocatedQuantity -= allocated;
                row.quantity -= allocated;
                remaining -= allocated;
            }
            recalcArticleTotals(line.articleNumber);
        }

        // Audit
        for (const line of order.orderLines) {
            appendAuditLog(
                AuditAction.OrderPicked,
                line.articleNumber,
                'order',
                order.orderId,
                `Order ${order.orderNumber}: picked ${line.pickedNumberOfItems}x ${line.articleNumber}`,
                { orderNumber: order.orderNumber },
            );
        }
    } else if (currentStatus === OrderStatusId.Picked) {
        nextStatus = OrderStatusId.Shipped;

        // Audit
        for (const line of order.orderLines) {
            appendAuditLog(
                AuditAction.OrderShipped,
                line.articleNumber,
                'order',
                order.orderId,
                `Order ${order.orderNumber}: shipped ${line.orderedNumberOfItems}x ${line.articleNumber}`,
                { orderNumber: order.orderNumber },
            );
        }
    } else {
        return HttpResponse.json({ message: 'Order already in terminal state' }, { status: 400 });
    }

    order.orderStatus = {
        statusId: nextStatus,
        statusText: OrderStatusLabel[nextStatus],
    };

    saveToStorage();
    return HttpResponse.json(order);
});

const getPickingList = http.get(`${BASE}/orders/:orderId/pickingList`, ({ params }) => {
    const id = Number(params['orderId']);
    const order = db.orders.find((o) => o.orderId === id);
    if (!order) {
        return HttpResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    if (order.orderStatus.statusId !== OrderStatusId.Created) {
        return HttpResponse.json(
            { message: 'Picking list only available for orders in Created status' },
            { status: 400 },
        );
    }

    const items = order.orderLines.flatMap((line) => {
        const article = findArticle(line.articleNumber);
        let remaining = line.orderedNumberOfItems;
        const result: {
            orderLineRowNumber: number;
            articleNumber: string;
            articleName: string;
            locationName: string;
            locationId: number;
            quantityToPick: number;
        }[] = [];

        const rows = locationsForArticle(line.articleNumber)
            .filter((r) => r.allocatedQuantity > 0)
            .sort((a, b) => {
                const zoneA = findLocation(a.locationId)?.zoneId ?? 99;
                const zoneB = findLocation(b.locationId)?.zoneId ?? 99;
                if (zoneA === 3 && zoneB !== 3) return -1;
                if (zoneB === 3 && zoneA !== 3) return 1;
                return 0;
            });

        for (const row of rows) {
            if (remaining <= 0) break;
            const pick = Math.min(row.allocatedQuantity, remaining);
            const loc = findLocation(row.locationId);
            result.push({
                orderLineRowNumber: line.rowNumber,
                articleNumber: line.articleNumber,
                articleName: article?.articleName ?? '',
                locationName: loc?.locationName ?? `LOC-${row.locationId}`,
                locationId: row.locationId,
                quantityToPick: pick,
            });
            remaining -= pick;
        }
        return result;
    });

    items.sort((a, b) => {
        const zA = findLocation(a.locationId)?.zoneId ?? 99;
        const zB = findLocation(b.locationId)?.zoneId ?? 99;
        return zA - zB || a.locationName.localeCompare(b.locationName);
    });

    return HttpResponse.json({
        orderId: order.orderId,
        orderNumber: order.orderNumber,
        items,
    });
});

const getOrderStatuses = http.get(`${BASE}/orders/statuses`, () => {
    const statuses = Object.entries(OrderStatusLabel).map(([id, text]) => ({
        statusId: Number(id),
        statusText: text,
    }));
    return HttpResponse.json(statuses);
});

export const ordersHandlers = [
    getOrders,
    putOrder,
    processOrder,
    getPickingList,
    getOrderStatuses
];
