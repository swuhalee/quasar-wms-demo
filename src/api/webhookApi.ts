import { api } from "src/boot/axios";
import type { WebhookEvent, WebhookEventType } from "src/models/Webhook";

export const webhookApi = {
    fetchEvents: () =>
        api.get<WebhookEvent[]>('/api/v1/webhooks').then((r) => r.data),

    simulateWebhook: (eventType: WebhookEventType, payload: Record<string, string | number | null>) =>
        api.post<WebhookEvent>('/api/v1/webhooks/simulate', { eventType, payload }).then((r) => r.data),
};
