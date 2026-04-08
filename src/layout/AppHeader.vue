<template>
  <el-header class="app-header">
    <div class="header-left">
      <button class="collapse-btn" @click="appStore.toggleSidebar()">
        <el-icon :size="18">
          <Fold v-if="!appStore.sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </button>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <div class="header-actions">
        <button class="action-btn" title="通知">
          <el-icon :size="18"><Bell /></el-icon>
          <span class="notification-dot"></span>
        </button>
        <button class="action-btn" title="全屏">
          <el-icon :size="18"><FullScreen /></el-icon>
        </button>
      </div>
      <div class="divider"></div>
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :src="userStore.userInfo?.avatar" class="user-avatar" />
          <div class="user-meta">
            <span class="username">{{ userStore.userInfo?.username }}</span>
            <span class="user-role">管理员</span>
          </div>
          <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand, Bell, FullScreen, ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { resetDynamicRoutes } from '@/router'

const appStore = useAppStore()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() =>
  route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({ path: r.path, title: r.meta.title as string }))
)

function handleCommand(command: string) {
  if (command === 'logout') {
    userStore.logout()
    permissionStore.resetRoutes()
    resetDynamicRoutes()
    router.push('/login')
  }
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ml-bg-sidebar);
  border-bottom: 1px solid var(--ml-border);
  padding: 0 20px;
  height: 64px;
  backdrop-filter: blur(12px);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.collapse-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--ml-radius-sm);
  border: 1px solid var(--ml-border);
  background: transparent;
  color: var(--ml-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--ml-transition);
}
.collapse-btn:hover {
  background: var(--ml-accent-soft);
  border-color: var(--ml-accent);
  color: var(--ml-accent);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.action-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--ml-radius-sm);
  border: none;
  background: transparent;
  color: var(--ml-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--ml-transition);
  position: relative;
}
.action-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--ml-text-primary);
}
.notification-dot {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 7px;
  height: 7px;
  background: var(--ml-danger);
  border-radius: 50%;
  border: 1.5px solid var(--ml-bg-sidebar);
}

.divider {
  width: 1px;
  height: 24px;
  background: var(--ml-border-light);
  margin: 0 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--ml-radius-sm);
  transition: var(--ml-transition);
}
.user-info:hover {
  background: rgba(255, 255, 255, 0.04);
}
.user-avatar {
  border: 2px solid var(--ml-accent-soft);
}
.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.username {
  font-size: 13px;
  font-weight: 600;
  color: var(--ml-text-primary);
}
.user-role {
  font-size: 11px;
  color: var(--ml-text-muted);
}
.dropdown-arrow {
  font-size: 12px;
  color: var(--ml-text-muted);
  transition: var(--ml-transition);
}
</style>
