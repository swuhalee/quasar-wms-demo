<script setup lang="ts">
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { useCreateWorkflow } from 'src/composables/useWorkflowQuery';
import { computed, reactive } from 'vue';

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const $q = useQuasar();
const { createWorkflow, isLoading: isCreateLoading } = useCreateWorkflow();

const form = reactive({
    workflowName: '',
    statuses: [
        { statusId: 100, statusLabel: '', color: 'blue', isFinal: false },
        { statusId: 200, statusLabel: '', color: 'positive', isFinal: true },
    ],
    transitions: [
        { fromStatusId: 100, toStatusId: 200, actionLabel: '', icon: 'arrow_forward' },
    ],
});

function resetForm() {
    form.workflowName = '';
    form.statuses = [
        { statusId: 100, statusLabel: '', color: 'blue', isFinal: false },
        { statusId: 200, statusLabel: '', color: 'positive', isFinal: true },
    ];
    form.transitions = [
        { fromStatusId: 100, toStatusId: 200, actionLabel: '', icon: 'arrow_forward' },
    ];
}

const colorOptions = [
    { label: '파랑', value: 'blue' },
    { label: '초록', value: 'positive' },
    { label: '주황', value: 'orange' },
    { label: '빨강', value: 'negative' },
    { label: '보라', value: 'deep-purple' },
    { label: '청록', value: 'teal' },
    { label: '시안', value: 'cyan' },
    { label: '남색', value: 'indigo' },
    { label: '회색', value: 'grey' },
];

function addStatus() {
    const maxId = form.statuses.reduce((m, s) => Math.max(m, s.statusId), 0);
    form.statuses.push({ statusId: maxId + 100, statusLabel: '', color: 'grey', isFinal: false });
}

function addTransition() {
    form.transitions.push({ fromStatusId: 0, toStatusId: 0, actionLabel: '', icon: 'arrow_forward' });
}

const statusIdOptions = computed(() =>
    form.statuses.map((s) => ({ label: `${s.statusId} — ${s.statusLabel || '?'}`, value: s.statusId })),
);

function transitionLabel(fromId: number, toId: number) {
    const t = form.transitions.find((tr) => tr.fromStatusId === fromId && tr.toStatusId === toId);
    return t?.actionLabel || '';
}

async function saveWorkflow() {
    if (!form.workflowName) {
        $q.notify({ type: 'warning', message: '워크플로우 이름을 입력하세요.' });
        return;
    }
    try {
        await createWorkflow({
            workflowName: form.workflowName,
            statuses: form.statuses,
            transitions: form.transitions,
        });
        $q.notify({ type: 'positive', message: '워크플로우가 생성되었습니다.' });
        onDialogOK();
        resetForm();
    } catch (err: unknown) {
        $q.notify({ type: 'negative', message: err instanceof Error ? err.message : '실패했습니다.' });
    }
}
</script>

<template>
    <q-dialog ref="dialogRef" persistent @hide="onDialogHide">
        <q-card style="min-width: 700px">
            <q-card-section>
                <div class="text-h6">커스텀 워크플로우 생성</div>
            </q-card-section>

            <q-card-section>
                <q-input v-model="form.workflowName" label="워크플로우 이름" outlined dense />

                <div class="text-subtitle2 q-mt-md">상태</div>
                <div v-for="(s, idx) in form.statuses" :key="idx" class="row q-col-gutter-sm items-center q-mb-sm">
                    <div class="col-2">
                        <q-input v-model.number="s.statusId" type="number" label="ID" outlined dense />
                    </div>
                    <div class="col">
                        <q-input v-model="s.statusLabel" label="라벨" outlined dense />
                    </div>
                    <div class="col-2">
                        <q-select v-model="s.color" :options="colorOptions" label="색상" outlined dense emit-value
                            map-options>
                            <template v-slot:option="scope">
                                <q-item v-bind="scope.itemProps">
                                    <q-item-section avatar>
                                        <q-badge :color="scope.opt.value" label="  " />
                                    </q-item-section>
                                    <q-item-section>{{ scope.opt.label }}</q-item-section>
                                </q-item>
                            </template>
                        </q-select>
                    </div>
                    <div class="col-auto">
                        <q-toggle v-model="s.isFinal" label="최종" dense />
                    </div>
                    <div class="col-auto">
                        <q-btn flat round icon="delete" color="negative" size="sm"
                            @click="form.statuses.splice(idx, 1)" />
                    </div>
                </div>
                <q-btn flat icon="add" padding="2px 6px" label="상태 추가" color="primary" @click="addStatus" />

                <div class="text-subtitle2 q-mt-md">전이</div>
                <div v-for="(t, idx) in form.transitions" :key="idx" class="row q-col-gutter-sm items-center q-mb-sm">
                    <div class="col-3">
                        <q-select v-model="t.fromStatusId" :options="statusIdOptions" label="출발" outlined dense
                            emit-value map-options />
                    </div>
                    <div class="col-3">
                        <q-select v-model="t.toStatusId" :options="statusIdOptions" label="도착" outlined dense emit-value
                            map-options />
                    </div>
                    <div class="col">
                        <q-input v-model="t.actionLabel" label="액션 라벨" outlined dense />
                    </div>
                    <div class="col-2">
                        <q-input v-model="t.icon" label="아이콘(material icon)" outlined dense />
                    </div>
                    <div class="col-auto">
                        <q-btn flat round icon="delete" color="negative" size="sm"
                            @click="form.transitions.splice(idx, 1)" />
                    </div>
                </div>
                <q-btn flat icon="add" padding="2px 6px" label="전이 추가" color="primary" @click="addTransition" />

                <div class="text-subtitle2 q-mt-md">미리보기</div>
                <div class="row items-center justify-center q-pa-md bg-grey-2 rounded-borders"
                    style="flex-wrap: nowrap; overflow-x: auto; gap: 8px">
                    <template v-for="(status, idx) in form.statuses" :key="idx">
                        <div class="text-center">
                            <q-chip :color="status.color || 'grey'" text-color="white"
                                :label="status.statusLabel || '?'" :icon="status.isFinal ? 'flag' : undefined" />
                        </div>
                        <template v-if="idx < form.statuses.length - 1">
                            <div class="text-center">
                                <q-icon name="arrow_forward" color="grey" size="sm" />
                                <div class="text-caption text-grey-7">{{ transitionLabel(status.statusId,
                                    form.statuses[idx + 1]?.statusId ?? 0) }}</div>
                            </div>
                        </template>
                    </template>
                </div>
            </q-card-section>

            <q-card-actions align="right">
                <q-btn flat label="취소" @click="onDialogCancel" />
                <q-btn color="primary" label="워크플로우 저장" :loading="isCreateLoading" @click="saveWorkflow" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>
