import { http, HttpResponse } from 'msw';
import { BASE } from '../helper';
import { db, saveToStorage } from '../data/db';
import { CustomWorkflow } from 'src/models/Workflow';

const getWorkflows = http.get(`${BASE}/workflows`, () => {
    return HttpResponse.json(db.customWorkflows);
});

interface CreateWorkflowBody {
    workflowName: string;
    statuses: { statusId: number; statusLabel: string; color: string; isFinal: boolean }[];
    transitions: { fromStatusId: number; toStatusId: number; actionLabel: string; icon: string }[];
}

const postWorkflow = http.post(`${BASE}/workflows`, async ({ request }) => {
    const body = (await request.json()) as CreateWorkflowBody;

    if (body.statuses.length < 2) {
        return HttpResponse.json(
            { message: 'At least 2 statuses required' },
            { status: 400 },
        );
    }
    if (body.transitions.length < 1) {
        return HttpResponse.json(
            { message: 'At least 1 transition required' },
            { status: 400 },
        );
    }
    if (!body.statuses.some((s) => s.isFinal)) {
        return HttpResponse.json(
            { message: 'At least 1 final status required' },
            { status: 400 },
        );
    }

    const statusIds = new Set(body.statuses.map((s) => s.statusId));
    for (const t of body.transitions) {
        if (!statusIds.has(t.fromStatusId) || !statusIds.has(t.toStatusId)) {
            return HttpResponse.json(
                { message: 'Transition references unknown status ID' },
                { status: 400 },
            );
        }
    }

    const workflow: CustomWorkflow = {
        workflowId: db.nextWorkflowId++,
        workflowName: body.workflowName,
        statuses: body.statuses,
        transitions: body.transitions,
        createdDate: new Date().toISOString(),
    };
    db.customWorkflows.push(workflow);
    saveToStorage();
    return HttpResponse.json(workflow, { status: 200 });
});

const deleteWorkflow = http.delete(`${BASE}/workflows/:workflowId`, ({ params }) => {
    const id = Number(params['workflowId']);
    if (id === 1) {
        return HttpResponse.json(
            { message: 'Cannot delete the default workflow' },
            { status: 400 },
        );
    }
    const idx = db.customWorkflows.findIndex((w) => w.workflowId === id);
    if (idx === -1) {
        return HttpResponse.json({ message: 'Workflow not found' }, { status: 404 });
    }
    db.customWorkflows.splice(idx, 1);
    saveToStorage();
    return HttpResponse.json({ message: 'Deleted' });
});

export const workflowsHandlers = [
    getWorkflows,
    postWorkflow,
    deleteWorkflow
];
