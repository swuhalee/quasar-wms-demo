import { http, HttpResponse } from 'msw';
import { appendAuditLog, BASE, findArticle, findLocation, recalcArticleTotals } from '../helper';
import { db, saveToStorage } from '../data/db';
import type { PurchaseOrder } from 'src/models/PurchaseOrder';
import { AuditAction } from 'src/models/AuditLog';

const getPurchaseOrders = http.get(`${BASE}/purchaseOrders`, () => {
    return HttpResponse.json(db.purchaseOrders);
});

interface PostPurchaseOrderBody {
    purchaseOrderNumber: string;
    goodsOwnerId?: number;
    purchaseOrderLines: {
        rowNumber: number;
        articleNumber: string;
        orderedNumberOfItems: number;
        locationId?: number;
    }[];
    purchaseOrderRemark?: string;
}

const postPurchaseOrder = http.post(`${BASE}/purchaseOrders`, async ({ request }) => {
    const body = (await request.json()) as PostPurchaseOrderBody;

    for (const line of body.purchaseOrderLines) {
        if (!findArticle(line.articleNumber)) {
            return HttpResponse.json(
                { message: `Article ${line.articleNumber} not found` },
                { status: 400 },
            );
        }
        if (line.locationId && !findLocation(line.locationId)) {
            return HttpResponse.json(
                { message: `Location ${line.locationId} not found` },
                { status: 400 },
            );
        }
    }

    for (const line of body.purchaseOrderLines) {
        const locId = line.locationId ?? 1;
        const existing = db.articleItemLocations.find(
            (r) => r.articleNumber === line.articleNumber && r.locationId === locId,
        );
        if (existing) {
            existing.quantity += line.orderedNumberOfItems;
        } else {
            db.articleItemLocations.push({
                articleNumber: line.articleNumber,
                locationId: locId,
                quantity: line.orderedNumberOfItems,
                allocatedQuantity: 0,
            });
        }
        recalcArticleTotals(line.articleNumber);
    }

    const po: PurchaseOrder = {
        purchaseOrderId: db.nextPurchaseOrderId++,
        purchaseOrderNumber: body.purchaseOrderNumber,
        goodsOwnerId: body.goodsOwnerId ?? 1,
        purchaseOrderLines: body.purchaseOrderLines.map((l) => ({
            rowNumber: l.rowNumber,
            articleNumber: l.articleNumber,
            orderedNumberOfItems: l.orderedNumberOfItems,
        })),
        purchaseOrderRemark: body.purchaseOrderRemark ?? '',
        inDate: new Date().toISOString(),
    };

    db.purchaseOrders.push(po);

    // Audit
    for (const line of po.purchaseOrderLines) {
        appendAuditLog(
            AuditAction.PurchaseOrderReceived,
            line.articleNumber,
            'purchaseOrder',
            po.purchaseOrderId,
            `PO ${po.purchaseOrderNumber}: received ${line.orderedNumberOfItems}x ${line.articleNumber}`,
            { purchaseOrderNumber: po.purchaseOrderNumber },
        );
    }

    saveToStorage();
    return HttpResponse.json(po, { status: 200 });
});

export const purchaseOrdersHandlers = [
    getPurchaseOrders,
    postPurchaseOrder
];
