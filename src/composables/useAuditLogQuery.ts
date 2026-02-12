import { useQuery } from '@pinia/colada';
import { auditLogApi } from 'src/api/auditLogApi';
import { computed } from 'vue';

export const AUDIT_LOG_KEYS = {
    logs: ['audit_log'] as const,
    articleLogs: (articleNumber: string) => ['audit_log', articleNumber] as const,
};

/** 작업 이력 목록 조회 */
export function useAuditLog(options: { enabled?: () => boolean } = {}) {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...AUDIT_LOG_KEYS.logs],
        query: auditLogApi.fetchAuditLog,
        ...options,
    });

    const allLogs = computed(() => state.value.data ?? []);

    return { allLogs, isLoading, refresh };
}

/** 품목별 작업 이력 목록 조회 */
export function useArticleAuditLog(
    getArticleNumber: () => string,
    options: { enabled?: () => boolean } = {}
) {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...AUDIT_LOG_KEYS.articleLogs(getArticleNumber())],
        query: () => auditLogApi.fetchArticleAuditLog(getArticleNumber()),
        enabled: () => {
            const hasNumber = getArticleNumber().trim().length > 0;
            const externallyEnabled = options.enabled ? options.enabled() : true;
            return hasNumber && externallyEnabled;
        },
    });

    const articleLogs = computed(() => state.value.data ?? []);

    return { articleLogs, isLoading, refresh };
}
