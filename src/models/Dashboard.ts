import type { Article } from './Article';
import type { Order } from './Order';

export interface DashboardSummary {
    totalArticles: number;
    totalStock: number;
    sellableStock: number;
    ordersToday: number;
    zoneCount: number;
    locationCount: number;
    totalAllocated: number;
    movementsToday: number;
    returnsToday: number;
    recentOrders: Order[];
    lowStockArticles: Article[];
}
