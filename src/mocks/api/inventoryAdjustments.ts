import { http, HttpResponse } from 'msw';
import { appendAuditLog, BASE, findArticle, findLocation, recalcArticleTotals } from '../helper';
import { db, saveToStorage } from '../data/db';
import type { InventoryAdjustment } from 'src/models/InventoryAdjustment';
import { AuditAction } from 'src/models/AuditLog';

const getAdjustments = http.get(`${BASE}/inventoryAdjustments`, () => {
    return HttpResponse.json(db.adjustments);
});

interface PostAdjustmentBody {
    articleNumber: string;
    locationId: number;
    adjustedQuantity: number;
    reason: string;
}

const postAdjustment = http.post(`${BASE}/inventoryAdjustments`, async ({ request }) => {
    const body = (await request.json()) as PostAdjustmentBody;

    if (!findArticle(body.articleNumber)) {
        return HttpResponse.json({ message: 'Article not found' }, { status: 400 });
    }
    if (!findLocation(body.locationId)) {
        return HttpResponse.json({ message: 'Location not found' }, { status: 400 });
    }

    const row = db.articleItemLocations.find(
        (r) => r.articleNumber === body.articleNumber && r.locationId === body.locationId,
    );

    if (body.adjustedQuantity < 0) {
        const currentQty = row?.quantity ?? 0;
        const allocated = row?.allocatedQuantity ?? 0;
        if (currentQty + body.adjustedQuantity < allocated) {
            return HttpResponse.json(
                {
                    message: `Cannot reduce below allocated quantity (${allocated}). Max decrease: ${currentQty - allocated}.`,
                },
                { status: 400 },
            );
        }
    }

    if (row) {
        row.quantity += body.adjustedQuantity;
        if (row.quantity <= 0 && row.allocatedQuantity <= 0) {
            const idx = db.articleItemLocations.indexOf(row);
            if (idx !== -1) db.articleItemLocations.splice(idx, 1);
        }
    } else if (body.adjustedQuantity > 0) {
        db.articleItemLocations.push({
            articleNumber: body.articleNumber,
            locationId: body.locationId,
            quantity: body.adjustedQuantity,
            allocatedQuantity: 0,
        });
    } else {
        return HttpResponse.json(
            { message: 'No stock at this location to adjust' },
            { status: 400 },
        );
    }

    recalcArticleTotals(body.articleNumber);

    const adj: InventoryAdjustment = {
        adjustmentId: db.nextAdjustmentId++,
        articleNumber: body.articleNumber,
        locationId: body.locationId,
        adjustedQuantity: body.adjustedQuantity,
        reason: body.reason,
        adjustedDate: new Date().toISOString(),
    };
    db.adjustments.push(adj);

    // Audit
    appendAuditLog(
        AuditAction.StockAdjusted,
        body.articleNumber,
        'adjustment',
        adj.adjustmentId,
        `Adjusted ${body.articleNumber} at ${findLocation(body.locationId)?.locationName ?? body.locationId} by ${body.adjustedQuantity > 0 ? '+' : ''}${body.adjustedQuantity}: ${body.reason}`,
        { locationId: body.locationId, reason: body.reason },
    );

    saveToStorage();
    return HttpResponse.json(adj, { status: 200 });
});

export const inventoryAdjustmentsHandlers = [
    getAdjustments,
    postAdjustment
];
