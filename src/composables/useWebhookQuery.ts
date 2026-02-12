import { useQuery, useMutation, useQueryCache } from '@pinia/colada';
import { computed } from 'vue';
import { webhookApi } from 'src/api/webhookApi';
import type { WebhookEventType } from 'src/models/Webhook';
import { ORDER_KEYS } from './useOrderQuery';
import { ARTICLE_KEYS } from './useArticleQuery';
import { WAREHOUSE_KEYS } from './useWarehouseQuery';

export const WEBHOOK_KEYS = {
    events: ['webhook_events'] as const,
};

/** 이벤트 목록 조회 */
export function useEvents() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...WEBHOOK_KEYS.events],
        query: webhookApi.fetchEvents,
    });

    const events = computed(() => state.value.data ?? []);

    return { events, isLoading, refresh };
}

/** 이벤트 시뮬레이션 */
export function useSimulateWebhook() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: ({ eventType, payload }: { eventType: WebhookEventType; payload: Record<string, string | number | null> }) =>
            webhookApi.simulateWebhook(eventType, payload),
        onSuccess: () => {
            void queryCache.invalidateQueries({ key: WEBHOOK_KEYS.events });
            void queryCache.invalidateQueries({ key: ORDER_KEYS.list });
            void queryCache.invalidateQueries({ key: ARTICLE_KEYS.list });
            void queryCache.invalidateQueries({ key: WAREHOUSE_KEYS.articleItemLocations });
        },
    });

    return { simulateWebhook: mutateAsync, isLoading };
}
