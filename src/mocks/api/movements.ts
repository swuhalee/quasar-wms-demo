import { http, HttpResponse } from 'msw';
import { appendAuditLog, availableAt, BASE, findArticle, findLocation, recalcArticleTotals } from '../helper';
import { db, saveToStorage } from '../data/db';
import type { InventoryMovement } from 'src/models/InventoryMovement';
import { AuditAction } from 'src/models/AuditLog';

const getMovements = http.get(`${BASE}/movements`, () => {
    return HttpResponse.json(db.movements);
});

interface PostMovementBody {
    articleNumber: string;
    fromLocationId: number;
    toLocationId: number;
    quantity: number;
}

const postMovement = http.post(`${BASE}/movements`, async ({ request }) => {
    const body = (await request.json()) as PostMovementBody;

    if (!findArticle(body.articleNumber)) {
        return HttpResponse.json({ message: 'Article not found' }, { status: 400 });
    }
    if (!findLocation(body.fromLocationId)) {
        return HttpResponse.json({ message: 'Source location not found' }, { status: 400 });
    }
    if (!findLocation(body.toLocationId)) {
        return HttpResponse.json({ message: 'Destination location not found' }, { status: 400 });
    }
    if (body.fromLocationId === body.toLocationId) {
        return HttpResponse.json({ message: 'Source and destination must differ' }, { status: 400 });
    }
    if (body.quantity <= 0) {
        return HttpResponse.json({ message: 'Quantity must be positive' }, { status: 400 });
    }

    const avail = availableAt(body.articleNumber, body.fromLocationId);
    if (avail < body.quantity) {
        return HttpResponse.json(
            {
                message: `Only ${avail} available (non-allocated) units at source. Cannot move ${body.quantity}.`,
            },
            { status: 400 },
        );
    }

    const source = db.articleItemLocations.find(
        (r) => r.articleNumber === body.articleNumber && r.locationId === body.fromLocationId,
    );
    if (source) {
        source.quantity -= body.quantity;
    }

    const dest = db.articleItemLocations.find(
        (r) => r.articleNumber === body.articleNumber && r.locationId === body.toLocationId,
    );
    if (dest) {
        dest.quantity += body.quantity;
    } else {
        db.articleItemLocations.push({
            articleNumber: body.articleNumber,
            locationId: body.toLocationId,
            quantity: body.quantity,
            allocatedQuantity: 0,
        });
    }

    const srcIdx = db.articleItemLocations.findIndex(
        (r) =>
            r.articleNumber === body.articleNumber &&
            r.locationId === body.fromLocationId &&
            r.quantity <= 0 &&
            r.allocatedQuantity <= 0,
    );
    if (srcIdx !== -1) {
        db.articleItemLocations.splice(srcIdx, 1);
    }

    recalcArticleTotals(body.articleNumber);

    const movement: InventoryMovement = {
        movementId: db.nextMovementId++,
        articleNumber: body.articleNumber,
        fromLocationId: body.fromLocationId,
        toLocationId: body.toLocationId,
        quantity: body.quantity,
        movedDate: new Date().toISOString(),
    };
    db.movements.push(movement);

    // Audit
    const fromLoc = findLocation(body.fromLocationId);
    const toLoc = findLocation(body.toLocationId);
    appendAuditLog(
        AuditAction.StockMoved,
        body.articleNumber,
        'movement',
        movement.movementId,
        `Moved ${body.quantity}x ${body.articleNumber} from ${fromLoc?.locationName ?? body.fromLocationId} to ${toLoc?.locationName ?? body.toLocationId}`,
        { fromLocationId: body.fromLocationId, toLocationId: body.toLocationId },
    );

    saveToStorage();
    return HttpResponse.json(movement, { status: 200 });
});


export const movementsHandlers = [
    getMovements,
    postMovement
];
