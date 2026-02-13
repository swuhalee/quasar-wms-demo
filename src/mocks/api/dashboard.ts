import { http, HttpResponse } from 'msw';
import { BASE, isToday } from '../helper';
import { db } from '../data/db';
import type { DashboardSummary } from 'src/models/Dashboard';

const getDashboardSummary = http.get(`${BASE}/dashboard/summary`, () => {
    const totalArticles = db.articles.length;
    const totalStock = db.articles.reduce((s, a) => s + a.inventoryInfo.numberOfItems, 0);
    const sellableStock = db.articles.reduce((s, a) => s + a.inventoryInfo.sellableNumberOfItems, 0);
    const ordersToday = db.orders.filter((o) => isToday(o.createdDate)).length;
    const zoneCount = db.zones.length;
    const locationCount = db.locations.length;
    const totalAllocated = db.articleItemLocations.reduce((s, ail) => s + ail.allocatedQuantity, 0);
    const movementsToday = db.movements.filter((m) => isToday(m.movedDate)).length;
    const returnsToday = db.returnOrders.filter((r) => isToday(r.createdDate)).length;

    const recentOrders = [...db.orders]
        .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
        .slice(0, 5);

    const lowStockArticles = db.articles.filter(
        (a) => a.inventoryInfo.sellableNumberOfItems < a.reorderPoint,
    );

    const summary: DashboardSummary = {
        totalArticles,
        totalStock,
        sellableStock,
        ordersToday,
        zoneCount,
        locationCount,
        totalAllocated,
        movementsToday,
        returnsToday,
        recentOrders,
        lowStockArticles,
    };

    return HttpResponse.json(summary);
});

export const dashboardHandlers = [
    getDashboardSummary,
];
