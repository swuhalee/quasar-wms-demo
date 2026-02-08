import type { Article } from "src/models/Article";
import type { AuditLogEntry } from "src/models/AuditLog";
import type { InventoryAdjustment } from "src/models/InventoryAdjustment";
import type { ArticleItemLocation } from "src/models/InventoryLocation";
import type { InventoryMovement } from "src/models/InventoryMovement";
import type { Order } from "src/models/Order";
import type { PurchaseOrder } from "src/models/PurchaseOrder";
import type { ReturnOrder } from "src/models/ReturnOrder";
import type { Location, Warehouse, Zone } from "src/models/Warehouse";
import type { WebhookEvent } from "src/models/Webhook";
import type { CustomWorkflow } from "src/models/Workflow";
import { seedArticleItemLocations, seedArticles, seedAuditLog, seedCustomWorkflows, seedLocations, seedOrders, seedReturnOrders, seedWarehouses, seedZones } from "./seed";


// public db singleton
export const db: MockDb = loadFromStorage() ?? buildSeedDb();

export function resetDb(): void {
    const fresh = buildSeedDb();
    Object.assign(db, fresh);
    saveToStorage();
}



const STORAGE_KEY = 'wms-demo-db';

export interface MockDb {
    articles: Article[];
    purchaseOrders: PurchaseOrder[];
    orders: Order[];
    warehouses: Warehouse[];
    zones: Zone[];
    locations: Location[];
    articleItemLocations: ArticleItemLocation[];
    movements: InventoryMovement[];
    adjustments: InventoryAdjustment[];
    returnOrders: ReturnOrder[];
    webhookEvents: WebhookEvent[];
    auditLog: AuditLogEntry[];
    customWorkflows: CustomWorkflow[];
    nextArticleSystemId: number;
    nextPurchaseOrderId: number;
    nextOrderId: number;
    nextMovementId: number;
    nextAdjustmentId: number;
    nextReturnOrderId: number;
    nextWebhookEventId: number;
    nextAuditId: number;
    nextWorkflowId: number;
}

// 테스트를 위해 미리 정의된 seed 데이터를 채워넣음
function buildSeedDb(): MockDb {
    return {
        articles: seedArticles(),
        purchaseOrders: [],
        orders: seedOrders(),
        warehouses: seedWarehouses(),
        zones: seedZones(),
        locations: seedLocations(),
        articleItemLocations: seedArticleItemLocations(),
        movements: [],
        adjustments: [],
        returnOrders: seedReturnOrders(),
        webhookEvents: [],
        auditLog: seedAuditLog(),
        customWorkflows: seedCustomWorkflows(),
        nextArticleSystemId: 7,
        nextPurchaseOrderId: 1,
        nextOrderId: 3,
        nextMovementId: 1,
        nextAdjustmentId: 1,
        nextReturnOrderId: 2,
        nextWebhookEventId: 1,
        nextAuditId: 4,
        nextWorkflowId: 2,
    };
}

// 브라우저를 새로고침해도 데이터가 유지되도록 로컬 스토리지에서 읽어옴
function loadFromStorage(): MockDb | null {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;

        const loaded = JSON.parse(raw) as Record<string, unknown>;

        // Migrate: 업데이트로 인해 새로운 필드가 추가되었을 경우,
        // 기존 데이터에 빈 값을 채워 넣어 에러 방지
        if (!loaded.returnOrders) loaded.returnOrders = [];
        if (!loaded.webhookEvents) loaded.webhookEvents = [];
        if (!loaded.auditLog) loaded.auditLog = seedAuditLog();
        if (!loaded.customWorkflows) loaded.customWorkflows = seedCustomWorkflows();
        if (loaded.nextReturnOrderId === undefined) loaded.nextReturnOrderId = 1;
        if (loaded.nextWebhookEventId === undefined) loaded.nextWebhookEventId = 1;
        if (loaded.nextAuditId === undefined) loaded.nextAuditId = 4;
        if (loaded.nextWorkflowId === undefined) loaded.nextWorkflowId = 2;
        const articles = loaded.articles as Article[] | undefined;
        if (articles) {
            const seeds = seedArticles();
            for (const art of articles) {
                if (art.reorderPoint === undefined) {
                    const seed = seeds.find((s) => s.articleNumber === art.articleNumber);
                    art.reorderPoint = seed?.reorderPoint ?? 10;
                }
            }
        }
        return loaded as unknown as MockDb;
    } catch {
        return null;
    }
}

export function saveToStorage(): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch {
        // 용량 초과(quota exceeded) 등 오류 발생 시 무시함
    }
}

export function clearStorage(): void {
    localStorage.removeItem(STORAGE_KEY);
}
