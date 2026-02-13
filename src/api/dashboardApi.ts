import { api } from 'src/boot/axios';
import type { DashboardSummary } from 'src/models/Dashboard';

export const dashboardApi = {
    fetchSummary: () =>
        api.get<DashboardSummary>('/api/v1/dashboard/summary').then((r) => r.data),
};
