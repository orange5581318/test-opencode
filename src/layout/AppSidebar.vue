<template>
  <el-aside :width="appStore.sidebarCollapsed ? '72px' : '220px'" class="app-sidebar">
    <div class="logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="9" height="9" rx="2" fill="var(--ml-accent)" opacity="0.9"/>
          <rect x="13" y="2" width="9" height="9" rx="2" fill="var(--ml-accent)" opacity="0.5"/>
          <rect x="2" y="13" width="9" height="9" rx="2" fill="var(--ml-accent)" opacity="0.5"/>
          <rect x="13" y="13" width="9" height="9" rx="2" fill="var(--ml-accent)" opacity="0.3"/>
        </svg>
      </div>
      <transition name="fade">
        <span v-if="!appStore.sidebarCollapsed" class="logo-text">Mall Admin</span>
      </transition>
    </div>
    <el-menu
      :default-active="route.path"
      :collapse="appStore.sidebarCollapsed"
      router
      class="sidebar-menu"
    >
      <el-menu-item
        v-for="menu in permissionStore.menus.filter(m => !m.hidden)"
        :key="menu.id"
        :index="menu.path"
      >
        <el-icon><component :is="menu.icon" /></el-icon>
        <template #title>{{ menu.name }}</template>
      </el-menu-item>
    </el-menu>
    <div class="sidebar-footer">
      <div class="version-badge">v1.0</div>
    </div>
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
  background: var(--ml-bg-sidebar);
  border-right: 1px solid var(--ml-border);
  transition: width var(--ml-transition-slow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}
.app-sidebar::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 1px;
  height: 100%;
  background: linear-gradient(to bottom, var(--ml-accent-soft), transparent 30%, transparent 70%, var(--ml-accent-soft));
  pointer-events: none;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid var(--ml-border);
  flex-shrink: 0;
}
.logo-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.logo-text {
  font-family: var(--ml-font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--ml-text-bright);
  letter-spacing: -0.3px;
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border-right: none !important;
  background: transparent !important;
  padding: 8px;
  overflow-y: auto;
}
.sidebar-menu:not(.el-menu--collapse) {
  width: auto;
}

/* Menu items */
.sidebar-menu :deep(.el-menu-item) {
  height: 42px;
  line-height: 42px;
  margin-bottom: 2px;
  border-radius: var(--ml-radius-sm);
  color: var(--ml-text-secondary);
  transition: var(--ml-transition);
  font-size: 13.5px;
  font-weight: 450;
}
.sidebar-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.05);
  color: var(--ml-text-primary);
}
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: var(--ml-accent-soft);
  color: var(--ml-accent);
  font-weight: 600;
}
.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: var(--ml-accent);
}
.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
  transition: var(--ml-transition);
}

.sidebar-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--ml-border);
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}
.version-badge {
  font-size: 11px;
  color: var(--ml-text-muted);
  background: rgba(255, 255, 255, 0.04);
  padding: 2px 10px;
  border-radius: 10px;
  letter-spacing: 0.5px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
