import { useMutation, useQuery, useQueryCache } from '@pinia/colada';
import { type CreateWorkflowPayload, workflowApi } from 'src/api/workflowApi';
import { computed } from 'vue';

export const WORKFLOW_KEYS = {
    list: ['workflows'] as const,
};

/** 워크플로우 목록 조회 */
export function useWorkflows() {
    const { state, refresh, isLoading } = useQuery({
        key: () => [...WORKFLOW_KEYS.list],
        query: workflowApi.fetchWorkflows,
    });

    const workflows = computed(() => state.value.data ?? []);

    return { workflows, isLoading, refresh };
}

/** 워크플로우 생성 */
export function useCreateWorkflow() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (payload: CreateWorkflowPayload) => workflowApi.createWorkflow(payload),
        onSuccess: () => {
            void queryCache.invalidateQueries({ key: WORKFLOW_KEYS.list });
        },
    });

    return { createWorkflow: mutateAsync, isLoading };
}

/** 워크플로우 삭제 */
export function useDeleteWorkflow() {
    const queryCache = useQueryCache();

    const { mutateAsync, isLoading } = useMutation({
        mutation: (workflowId: number) => workflowApi.deleteWorkflow(workflowId),
        onSuccess: () => {
            void queryCache.invalidateQueries({ key: WORKFLOW_KEYS.list });
        },
    });

    return { deleteWorkflow: mutateAsync, isLoading };
}
