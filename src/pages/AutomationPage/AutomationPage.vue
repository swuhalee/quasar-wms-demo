<script setup lang="ts">
import WebhookSimulatorCard from './components/WebhookSimulatorCard.vue';
import EventTypeInfoCard from './components/EventTypeInfoCard.vue';
import WebhookEventLogCard from './components/WebhookEventLogCard.vue';
</script>

<template>
    <q-page padding>
        <div class="row items-center q-mb-lg">
            <div class="text-h5">자동화 및 웹훅</div>
        </div>

        <q-banner class="bg-blue-1 text-blue-9 q-mb-lg" rounded>
            <template v-slot:avatar>
                <q-icon name="info" color="blue" />
            </template>
            실제 운영 환경에서는 배송사, 공급자, 이커머스 플랫폼 등 외부 시스템이 웹훅을 통해 WMS와 자동으로 연동됩니다.
            이 데모에서는 외부 시스템이 없으므로 <strong>시뮬레이터</strong>를 통해 웹훅 이벤트를 직접 발생시켜 테스트할 수 있습니다.
        </q-banner>

        <div class="row q-col-gutter-md q-mb-lg">
            <div class="col-12 col-md-6">
                <WebhookSimulatorCard />
            </div>
            <div class="col-12 col-md-6">
                <EventTypeInfoCard />
            </div>
        </div>

        <WebhookEventLogCard />
    </q-page>
</template>
