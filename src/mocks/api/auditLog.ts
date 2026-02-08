import { http, HttpResponse } from 'msw';
import { BASE } from '../helper';
import { db } from '../data/db';

const getAuditLog = http.get(`${BASE}/auditLog`, () => {
    const sorted = [...db.auditLog].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    return HttpResponse.json(sorted);
});

const getArticleAuditLog = http.get(`${BASE}/auditLog/article/:articleNumber`, ({ params }) => {
    const articleNumber = params['articleNumber'] as string;
    const filtered = db.auditLog
        .filter((e) => e.articleNumber === articleNumber)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return HttpResponse.json(filtered);
});

export const auditLogHandlers = [
    getAuditLog,
    getArticleAuditLog
];
