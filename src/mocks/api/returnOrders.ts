
import { http, HttpResponse } from 'msw';
import { appendAuditLog, BASE, findArticle, recalcArticleTotals } from '../helper';
import { db, saveToStorage } from '../data/db';
import type { ReturnCause, ReturnOrder } from 'src/models/ReturnOrder';
import { ReturnCauseLabel, ReturnStatusId, ReturnStatusLabel } from 'src/models/ReturnOrder';
import { OrderStatusId } from 'src/models/Order';
import { AuditAction } from 'src/models/AuditLog';

const getReturnOrders = http.get(`${BASE}/returnOrders`, () => {
    return HttpResponse.json(db.returnOrders);
});

const getReturnCauseSummary = http.get(`${BASE}/returnOrders/causeSummary`, () => {
    const counts: Record<string, number> = {};
    for (const ro of db.returnOrders) {
        for (const line of ro.returnLines) {
            counts[line.cause] = (counts[line.cause] ?? 0) + line.returnedNumberOfItems;
        }
    }
    const summary = Object.entries(counts).map(([cause, count]) => ({
        cause,
        causeLabel: ReturnCauseLabel[cause as ReturnCause] ?? cause,
        count,
    }));
    return HttpResponse.json(summary);
});

interface PostReturnOrderBody {
    returnOrderNumber: string;
    originalOrderNumber: string;
    returnLines: {
        rowNumber: number;
        articleNumber: string;
        returnedNumberOfItems: number;
        cause: ReturnCause;
    }[];
    returnRemark?: string;
}

const postReturnOrder = http.post(`${BASE}/returnOrders`, async ({ request }) => {
    const body = (await request.json()) as PostReturnOrderBody;

    const origOrder = db.orders.find((o) => o.orderNumber === body.originalOrderNumber);
    if (!origOrder) {
        return HttpResponse.json(
            { message: `Original order ${body.originalOrderNumber} not found` },
            { status: 400 },
        );
    }
    if (origOrder.orderStatus.statusId !== OrderStatusId.Shipped) {
        return HttpResponse.json(
            { message: 'Can only create returns for shipped orders' },
            { status: 400 },
        );
    }

    for (const line of body.returnLines) {
        if (!findArticle(line.articleNumber)) {
            return HttpResponse.json(
                { message: `Article ${line.articleNumber} not found` },
                { status: 400 },
            );
        }
    }

    const ret: ReturnOrder = {
        returnOrderId: db.nextReturnOrderId++,
        returnOrderNumber: body.returnOrderNumber,
        originalOrderNumber: body.originalOrderNumber,
        goodsOwnerId: 1,
        returnStatus: {
            statusId: ReturnStatusId.Received,
            statusText: ReturnStatusLabel[ReturnStatusId.Received],
        },
        returnLines: body.returnLines.map((l) => ({
            rowNumber: l.rowNumber,
            articleNumber: l.articleNumber,
            returnedNumberOfItems: l.returnedNumberOfItems,
            cause: l.cause,
            inspectionNote: '',
            disposition: 'pending' as const,
        })),
        returnRemark: body.returnRemark ?? '',
        createdDate: new Date().toISOString(),
        processedDate: null,
    };

    db.returnOrders.push(ret);

    for (const line of ret.returnLines) {
        appendAuditLog(
            AuditAction.ReturnReceived,
            line.articleNumber,
            'returnOrder',
            ret.returnOrderId,
            `Return ${ret.returnOrderNumber}: received ${line.returnedNumberOfItems}x ${line.articleNumber} (${ReturnCauseLabel[line.cause]})`,
            { returnOrderNumber: ret.returnOrderNumber, cause: line.cause },
        );
    }

    saveToStorage();
    return HttpResponse.json(ret, { status: 200 });
});

const inspectReturnOrder = http.post(
    `${BASE}/returnOrders/:returnOrderId/inspect`,
    ({ params }) => {
        const id = Number(params['returnOrderId']);
        const ret = db.returnOrders.find((r) => r.returnOrderId === id);
        if (!ret) {
            return HttpResponse.json({ message: 'Return order not found' }, { status: 404 });
        }
        if (ret.returnStatus.statusId !== ReturnStatusId.Received) {
            return HttpResponse.json(
                { message: 'Can only inspect returns in Received status' },
                { status: 400 },
            );
        }

        ret.returnStatus = {
            statusId: ReturnStatusId.Inspected,
            statusText: ReturnStatusLabel[ReturnStatusId.Inspected],
        };

        for (const line of ret.returnLines) {
            appendAuditLog(
                AuditAction.ReturnInspected,
                line.articleNumber,
                'returnOrder',
                ret.returnOrderId,
                `Return ${ret.returnOrderNumber}: inspected ${line.returnedNumberOfItems}x ${line.articleNumber}`,
                { returnOrderNumber: ret.returnOrderNumber },
            );
        }

        saveToStorage();
        return HttpResponse.json(ret);
    },
);

interface ProcessReturnBody {
    lineDispositions: {
        rowNumber: number;
        disposition: 'restock' | 'damaged';
        inspectionNote: string;
    }[];
}

const processReturnOrder = http.post(
    `${BASE}/returnOrders/:returnOrderId/process`,
    async ({ params, request }) => {
        const id = Number(params['returnOrderId']);
        const ret = db.returnOrders.find((r) => r.returnOrderId === id);
        if (!ret) {
            return HttpResponse.json({ message: 'Return order not found' }, { status: 404 });
        }
        if (ret.returnStatus.statusId !== ReturnStatusId.Inspected) {
            return HttpResponse.json(
                { message: 'Can only process returns in Inspected status' },
                { status: 400 },
            );
        }

        const body = (await request.json()) as ProcessReturnBody;

        for (const disp of body.lineDispositions) {
            const line = ret.returnLines.find((l) => l.rowNumber === disp.rowNumber);
            if (!line) continue;

            line.disposition = disp.disposition;
            line.inspectionNote = disp.inspectionNote;

            if (disp.disposition === 'restock') {
                // Add inventory back to Receiving zone (RCV-01, locationId=1)
                const existing = db.articleItemLocations.find(
                    (r) => r.articleNumber === line.articleNumber && r.locationId === 1,
                );
                if (existing) {
                    existing.quantity += line.returnedNumberOfItems;
                } else {
                    db.articleItemLocations.push({
                        articleNumber: line.articleNumber,
                        locationId: 1,
                        quantity: line.returnedNumberOfItems,
                        allocatedQuantity: 0,
                    });
                }
                recalcArticleTotals(line.articleNumber);

                appendAuditLog(
                    AuditAction.ReturnRestocked,
                    line.articleNumber,
                    'returnOrder',
                    ret.returnOrderId,
                    `Return ${ret.returnOrderNumber}: restocked ${line.returnedNumberOfItems}x ${line.articleNumber} to RCV-01`,
                    { returnOrderNumber: ret.returnOrderNumber },
                );
            } else {
                appendAuditLog(
                    AuditAction.ReturnDamaged,
                    line.articleNumber,
                    'returnOrder',
                    ret.returnOrderId,
                    `Return ${ret.returnOrderNumber}: ${line.returnedNumberOfItems}x ${line.articleNumber} marked as damaged`,
                    { returnOrderNumber: ret.returnOrderNumber, note: disp.inspectionNote },
                );
            }
        }

        // Determine overall status
        const allRestock = ret.returnLines.every((l) => l.disposition === 'restock');
        const allDamaged = ret.returnLines.every((l) => l.disposition === 'damaged');
        ret.returnStatus = {
            statusId: allDamaged ? ReturnStatusId.Damaged : ReturnStatusId.Restocked,
            statusText: allDamaged
                ? ReturnStatusLabel[ReturnStatusId.Damaged]
                : allRestock
                    ? ReturnStatusLabel[ReturnStatusId.Restocked]
                    : 'Restocked (partial)',
        };
        ret.processedDate = new Date().toISOString();

        saveToStorage();
        return HttpResponse.json(ret);
    },
);

export const returnOrdersHandlers = [
    getReturnOrders,
    getReturnCauseSummary,
    postReturnOrder,
    inspectReturnOrder,
    processReturnOrder
];
