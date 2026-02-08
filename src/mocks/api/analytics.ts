import { http, HttpResponse } from 'msw';
import { BASE, isToday } from '../helper';
import { db } from '../data/db';
import { OrderStatusId } from 'src/models/Order';

const getAbcAnalysis = http.get(`${BASE}/analytics/abcAnalysis`, () => {
    const articleScores = db.articles.map((art) => {
        const orderQty = db.orders.reduce((sum, o) => {
            return (
                sum +
                o.orderLines
                    .filter((l) => l.articleNumber === art.articleNumber)
                    .reduce((s, l) => s + l.orderedNumberOfItems, 0)
            );
        }, 0);

        const moveQty = db.movements.reduce((sum, m) => {
            return sum + (m.articleNumber === art.articleNumber ? m.quantity : 0);
        }, 0);

        return {
            articleNumber: art.articleNumber,
            articleName: art.articleName,
            orderLineQuantity: orderQty,
            totalMovementQuantity: moveQty,
            score: orderQty,
        };
    });

    articleScores.sort((a, b) => b.score - a.score);
    const total = articleScores.length;
    const result = articleScores.map((item, idx) => ({
        articleNumber: item.articleNumber,
        articleName: item.articleName,
        totalMovementQuantity: item.totalMovementQuantity,
        orderLineQuantity: item.orderLineQuantity,
        category: (idx < total * 0.2 ? 'A' : idx < total * 0.5 ? 'B' : 'C'),
    }));

    return HttpResponse.json(result);
});

const getPerformance = http.get(`${BASE}/analytics/performance`, () => {
    const ordersCreatedToday = db.orders.filter((o) => isToday(o.createdDate)).length;
    const ordersShippedToday = db.orders.filter(
        (o) => o.orderStatus.statusId === OrderStatusId.Shipped && isToday(o.createdDate),
    ).length;
    const ordersProcessedToday = db.orders.filter(
        (o) => o.orderStatus.statusId >= OrderStatusId.Picked && isToday(o.createdDate),
    ).length;
    const movementsToday = db.movements.filter((m) => isToday(m.movedDate)).length;
    const adjustmentsToday = db.adjustments.filter((a) => isToday(a.adjustedDate)).length;

    return HttpResponse.json({
        ordersProcessedToday,
        ordersCreatedToday,
        ordersShippedToday,
        averagePickingSpeed: ordersProcessedToday > 0 ? Math.round((ordersProcessedToday / 8) * 10) / 10 : 0,
        pickingEfficiency:
            ordersCreatedToday > 0
                ? Math.round((ordersShippedToday / ordersCreatedToday) * 100)
                : 0,
        movementsToday,
        adjustmentsToday,
    });
});

const getLowStockAlerts = http.get(`${BASE}/analytics/lowStockAlerts`, () => {
    const alerts = db.articles
        .filter((a) => a.inventoryInfo.sellableNumberOfItems < a.reorderPoint)
        .map((a) => ({
            articleNumber: a.articleNumber,
            articleName: a.articleName,
            currentSellable: a.inventoryInfo.sellableNumberOfItems,
            reorderPoint: a.reorderPoint,
            deficit: a.reorderPoint - a.inventoryInfo.sellableNumberOfItems,
        }))
        .sort((a, b) => b.deficit - a.deficit);
    return HttpResponse.json(alerts);
});

const getInventoryTrends = http.get(`${BASE}/analytics/inventoryTrends`, () => {
    const now = new Date();
    const currentTotal = db.articles.reduce((s, a) => s + a.inventoryInfo.numberOfItems, 0);
    const currentSellable = db.articles.reduce(
        (s, a) => s + a.inventoryInfo.sellableNumberOfItems,
        0,
    );

    const dates: string[] = [];
    const totalInventory: number[] = [];
    const sellableInventory: number[] = [];

    for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        dates.push(d.toISOString().slice(0, 10));

        // Simulate slight variations for historical data
        const factor = 1 + (Math.sin(i * 1.5) * 0.08);
        totalInventory.push(Math.round(currentTotal * factor));
        sellableInventory.push(Math.round(currentSellable * factor));
    }

    // Last point is actual current value
    totalInventory[6] = currentTotal;
    sellableInventory[6] = currentSellable;

    return HttpResponse.json({ dates, totalInventory, sellableInventory });
});

export const analyticsHandlers = [
    getAbcAnalysis,
    getPerformance,
    getLowStockAlerts,
    getInventoryTrends
];
