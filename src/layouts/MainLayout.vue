<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> wms-demo </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> menu </q-item-label>

        <!-- q-item: 리스트 아이템 -->
        <!-- v-ripple: 클릭했을 때 물결이 퍼지는 듯한 리플 효과임 -->
        <q-item v-for="nav in navlist" :key="nav.to" v-ripple clickable :to="nav.to" exact
          active-class="text-primary bg-blue-1">
          <!-- q-item-section: 아이템 내부의 구역 -->
          <q-item-section avatar>
            <q-icon :name="nav.icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ nav.title }}</q-item-label>
            <q-item-label caption>{{ nav.caption }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const navlist = [
  { title: '대시보드', caption: '요약 및 KPI', icon: 'dashboard', to: '/' },
  { title: '재고', caption: '품목 및 재고 수준', icon: 'inventory_2', to: '/inventory' },
  { title: '주문 처리', caption: '주문 생성 및 진행', icon: 'local_shipping', to: '/orders' },
  { title: '창고 지도', caption: '구역, 칸, 재고', icon: 'warehouse', to: '/warehouse' },
  { title: '재고 이동', caption: '이동 및 조정', icon: 'swap_horiz', to: '/movements' },
  { title: '반품', caption: '역물류', icon: 'assignment_return', to: '/returns' },
  { title: '자동화', caption: '웹훅 및 트리거', icon: 'smart_toy', to: '/automation' },
  { title: '분석', caption: '보고서 및 차트', icon: 'analytics', to: '/analytics' },
  { title: '스캐너', caption: '바코드 / PDA', icon: 'qr_code_scanner', to: '/scanner' },
  { title: '작업 이력', caption: 'SKU 이력', icon: 'history', to: '/audit' },
  { title: '워크플로우', caption: '커스텀 상태', icon: 'account_tree', to: '/workflows' },
];

const leftDrawerOpen = ref(false);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
</script>
