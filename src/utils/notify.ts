import { Notify } from 'quasar';

export function notifyError(err: unknown, fallback = '작업에 실패했습니다.') {
    Notify.create({
        type: 'negative',
        message: err instanceof Error ? err.message : fallback,
    });
}
