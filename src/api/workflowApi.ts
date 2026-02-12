import { api } from "src/boot/axios";
import type { CustomWorkflow, WorkflowStatusNode, WorkflowTransition } from "src/models/Workflow";

export interface CreateWorkflowPayload {
    workflowName: string;
    statuses: WorkflowStatusNode[];
    transitions: WorkflowTransition[];
}

export const workflowApi = {
    fetchWorkflows: () =>
        api.get<CustomWorkflow[]>('/api/v1/workflows').then((r) => r.data),

    createWorkflow: (payload: CreateWorkflowPayload) =>
        api.post<CustomWorkflow>('/api/v1/workflows', payload).then((r) => r.data),

    deleteWorkflow: (workflowId: number) =>
        api.delete(`/api/v1/workflows/${workflowId}`).then((r) => r.data),
};
