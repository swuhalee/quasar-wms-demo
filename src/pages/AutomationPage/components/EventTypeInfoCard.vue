<template>
    <q-card flat bordered>
        <q-card-section>
            <div class="text-subtitle1 text-weight-bold q-mb-sm">
                <q-icon name="info" color="primary" class="q-mr-sm" />이벤트 유형
            </div>
            <q-list>
                <q-item>
                    <q-item-section avatar><q-icon name="local_shipping" color="blue" /></q-item-section>
                    <q-item-section>
                        <q-item-label>배송 상태 업데이트</q-item-label>
                        <q-item-label caption>배송사 배송 확인 시 픽 완료 → 출고 완료로 진행</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section avatar><q-icon name="inventory" color="teal" /></q-item-section>
                    <q-item-section>
                        <q-item-label>공급자 출고 통보</q-item-label>
                        <q-item-label caption>공급자 출고 확인 시 RCV-01 입고 처리</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section avatar><q-icon name="sync" color="orange" /></q-item-section>
                    <q-item-section>
                        <q-item-label>외부 재고 동기화</q-item-label>
                        <q-item-label caption>외부 시스템이 로케이션별 재고 수량 동기화</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item>
                    <q-item-section avatar><q-icon name="assignment_return" color="purple" /></q-item-section>
                    <q-item-section>
                        <q-item-label>반품 접수</q-item-label>
                        <q-item-label caption>이커머스 플랫폼에서 반품 오더 생성</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-card-section>
    </q-card>
</template>
