import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'dashboard', component: () => import('pages/DashboardPage/DashboardPage.vue') },
      { path: 'inventory', name: 'inventory', component: () => import('pages/InventoryPage/InventoryPage.vue') },
      { path: 'orders', name: 'orders', component: () => import('pages/OrderFlowPage/OrderFlowPage.vue') },
      { path: 'warehouse', name: 'warehouse', component: () => import('pages/WarehouseMapPage/WarehouseMapPage.vue') },
      { path: 'movements', name: 'movements', component: () => import('pages/StockMovementPage/StockMovementPage.vue') },
      { path: 'returns', name: 'returns', component: () => import('pages/ReturnsPage/ReturnsPage.vue') },
      { path: 'automation', name: 'automation', component: () => import('pages/AutomationPage/AutomationPage.vue') },
      { path: 'analytics', name: 'analytics', component: () => import('pages/AnalyticsPage.vue') },
      { path: 'scanner', name: 'scanner', component: () => import('pages/ScannerPage/ScannerPage.vue') },
      { path: 'audit', name: 'audit', component: () => import('pages/AuditLogPage/AuditLogPage.vue') },
      { path: 'workflows', name: 'workflows', component: () => import('pages/WorkflowBuilderPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
