import { setupWorker } from 'msw/browser';
import { analyticsHandlers } from './api/analytics';
import { articlesHandlers } from './api/articles';
import { auditLogHandlers } from './api/auditLog';
import { inventoryAdjustmentsHandlers } from './api/inventoryAdjustments';
import { movementsHandlers } from './api/movements';
import { ordersHandlers } from './api/orders';
import { purchaseOrdersHandlers } from './api/purchaseOrders';
import { resetHandlers } from './api/reset';
import { returnOrdersHandlers } from './api/returnOrders';
import { scanHandlers } from './api/scan';
import { warehousesHandlers } from './api/warehouses';
import { webhooksHandlers } from './api/webhooks';
import { workflowsHandlers } from './api/workflows';

export const worker = setupWorker(
    ...analyticsHandlers,
    ...articlesHandlers,
    ...auditLogHandlers,
    ...inventoryAdjustmentsHandlers,
    ...movementsHandlers,
    ...ordersHandlers,
    ...purchaseOrdersHandlers,
    ...resetHandlers,
    ...returnOrdersHandlers,
    ...scanHandlers,
    ...warehousesHandlers,
    ...webhooksHandlers,
    ...workflowsHandlers
);
