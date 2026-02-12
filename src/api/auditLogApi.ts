import { api } from 'src/boot/axios';
import type { AuditLogEntry } from 'src/models/AuditLog';

export const auditLogApi = {
    fetchAuditLog: () =>
        api.get<AuditLogEntry[]>('/api/v1/auditLog').then((r) => r.data),
    fetchArticleAuditLog: (articleNumber: string) =>
        api.get<AuditLogEntry[]>(`/api/v1/auditLog/article/${articleNumber}`).then((r) => r.data),
};
