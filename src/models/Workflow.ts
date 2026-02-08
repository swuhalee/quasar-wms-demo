export interface WorkflowStatusNode {
    statusId: number;
    statusLabel: string;
    color: string;
    isFinal: boolean;
}

export interface WorkflowTransition {
    fromStatusId: number;
    toStatusId: number;
    actionLabel: string;
    icon: string;
}

export interface CustomWorkflow {
    workflowId: number;
    workflowName: string;
    statuses: WorkflowStatusNode[];
    transitions: WorkflowTransition[];
    createdDate: string;
}