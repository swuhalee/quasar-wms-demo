import type { AuditLogEntry, AuditAction } from "src/models/AuditLog";
import { db } from "./data/db";

export const BASE = '/api/v1';

export function findArticle(articleNumber: string) {
    return db.articles.find((a) => a.articleNumber === articleNumber);
}

export function findLocation(locationId: number) {
    return db.locations.find((l) => l.locationId === locationId);
}

export function locationsForArticle(articleNumber: string) {
    return db.articleItemLocations.filter((ail) => ail.articleNumber === articleNumber);
}

export function availableAt(articleNumber: string, locationId: number): number {
    const ail = db.articleItemLocations.find(
        (r) => r.articleNumber === articleNumber && r.locationId === locationId,
    );
    return ail ? ail.quantity - ail.allocatedQuantity : 0;
}

export function recalcArticleTotals(articleNumber: string) {
    const article = findArticle(articleNumber);
    if (!article) return;
    const rows = locationsForArticle(articleNumber);
    article.inventoryInfo.numberOfItems = rows.reduce((s, r) => s + r.quantity, 0);
    article.inventoryInfo.sellableNumberOfItems = rows.reduce(
        (s, r) => s + (r.quantity - r.allocatedQuantity),
        0,
    );
}

export function appendAuditLog(
    action: AuditAction,
    articleNumber: string | null,
    referenceType: AuditLogEntry['referenceType'],
    referenceId: number,
    description: string,
    details: Record<string, string | number | null> = {},
): void {
    const entry: AuditLogEntry = {
        auditId: db.nextAuditId++,
        timestamp: new Date().toISOString(),
        action,
        articleNumber,
        referenceType,
        referenceId,
        description,
        details,
    };
    db.auditLog.push(entry);
}

export function isToday(dateStr: string): boolean {
    const d = new Date(dateStr);
    const now = new Date();
    return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    );
}
