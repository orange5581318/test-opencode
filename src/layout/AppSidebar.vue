<template>
  <el-aside :width="appStore.sidebarCollapsed ? '64px' : '200px'" class="app-sidebar">
    <div class="logo">
      <span v-if="!appStore.sidebarCollapsed">商城后台</span>
      <span v-else>M</span>
    </div>
    <el-menu
      :default-active="route.path"
      :collapse="appStore.sidebarCollapsed"
      router
      background-color="#001529"
      text-color="#ffffffa6"
      active-text-color="#ffffff"
    >
      <el-menu-item
        v-for="menu in permissionStore.menus"
        :key="menu.id"
        :index="menu.path"
      >
        <el-icon><component :is="menu.icon" /></el-icon>
        <template #title>{{ menu.name }}</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
</script>

<style scoped>
.app-sidebar {
  background: #001529;
  transition: width 0.3s;
  overflow: hidden;
}
.logo {
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #ffffff1a;
}
</style>
