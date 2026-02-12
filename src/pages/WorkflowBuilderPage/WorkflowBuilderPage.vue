<script setup lang="ts">
import { useQuasar } from 'quasar';
import { useDeleteWorkflow, useWorkflows } from 'src/composables/useWorkflowQuery';
import WorkflowBuilderDialog from './components/ WorkflowBuilderDialog.vue';

const $q = useQuasar();
const { workflows } = useWorkflows();
const { deleteWorkflow } = useDeleteWorkflow();

function openBuilderDialog() {
    $q.dialog({
        component: WorkflowBuilderDialog,
    });
}

function deleteWf(id: number) {
    $q.dialog({
        title: '워크플로우 삭제',
        message: '이 워크플로우를 삭제하시겠습니까?',
        cancel: true,
        persistent: true,
    }).onOk(() => {
        void (async () => {
            try {
                await deleteWorkflow(id);
                $q.notify({ type: 'positive', message: '워크플로우가 삭제되었습니다.' });
            } catch (err: unknown) {
                $q.notify({
                    type: 'negative',
                    message: err instanceof Error ? err.message : '실패했습니다.'
                });
            }
        })();
    });
}
</script>

<template>
    <q-page padding>
        <div class="row items-center q-mb-lg">
            <div class="text-h5 q-mr-auto">워크플로우 빌더</div>
            <q-btn color="primary" icon="add" label="새 워크플로우" @click="openBuilderDialog" />
        </div>

        <q-banner class="bg-blue-1 text-blue-9 q-mb-lg" rounded>
            <template v-slot:avatar>
                <q-icon name="info" color="blue" />
            </template>
            창고마다 물건을 처리하는 순서가 다릅니다.
            예를 들어 어떤 창고는 <strong>주문접수 → 피킹 → 출고</strong>로 끝나지만,
            다른 창고는 <strong>주문접수 → 피킹 → 검수 → 포장 → 출고</strong>처럼 단계가 더 많을 수 있습니다.
            워크플로우 빌더에서 우리 창고에 맞는 작업 단계를 자유롭게 만들어 보세요.
        </q-banner>

        <div class="row q-col-gutter-md q-mb-lg">
            <div v-for="wf in workflows" :key="wf.workflowId" class="col-12 col-md-6">
                <q-card flat bordered>
                    <q-card-section>
                        <div class="row items-center no-wrap">
                            <q-icon name="account_tree" color="primary" size="sm" class="q-mr-sm" />
                            <div class="text-h6 ellipsis">{{ wf.workflowName }}</div>
                            <q-space />
                            <q-btn v-if="wf.workflowId !== 1" flat round icon="delete" color="negative" size="sm"
                                @click="deleteWf(wf.workflowId)" />
                            <q-badge v-else color="grey" label="기본" />
                        </div>
                    </q-card-section>
                    <q-separator />

                    <q-card-section>
                        <div class="row items-center justify-center q-gutter-sm"
                            style="flex-wrap: nowrap; overflow-x: auto">
                            <template v-for="(status, idx) in wf.statuses" :key="status.statusId">
                                <div class="text-center">
                                    <q-chip :color="status.color" text-color="white" :label="status.statusLabel"
                                        :icon="status.isFinal ? 'flag' : undefined" />
                                </div>
                                <q-icon v-if="idx < wf.statuses.length - 1" name="arrow_forward" color="grey"
                                    size="sm" />
                            </template>
                        </div>
                    </q-card-section>
                    <q-separator />
                    <q-card-section class="q-pa-sm">
                        <div class="text-caption text-grey">
                            상태 {{ wf.statuses.length }}개, 전이 {{ wf.transitions.length }}개
                            <span class="float-right">생성일 {{ new Date(wf.createdDate).toLocaleDateString() }}</span>
                        </div>
                    </q-card-section>
                </q-card>
            </div>
        </div>
    </q-page>
</template>
