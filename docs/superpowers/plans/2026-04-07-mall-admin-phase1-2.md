# 商城后台管理系统 Phase 1-2 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建项目基础设施（依赖、Axios、Pinia、Mock、布局）并实现登录鉴权 + 动态路由权限系统。

**Architecture:** 分层架构，api/stores/views/layout 各司其职。登录后从 Mock 接口获取 token 和菜单，permissionStore 动态注册路由，路由守卫控制访问。

**Tech Stack:** Vue 3 + Vite + TypeScript + Element Plus + Pinia + Axios + mockjs + vite-plugin-mock

---

## 文件清单

### 新建文件
- `src/utils/auth.ts` — token 读写
- `src/api/request.ts` — Axios 实例 + 拦截器
- `src/api/user.ts` — 登录、获取用户信息、获取菜单接口
- `src/stores/app.ts` — 侧边栏折叠状态
- `src/stores/user.ts` — token、用户信息
- `src/stores/permission.ts` — 动态路由、菜单列表
- `src/router/routes.ts` — 静态路由 + 动态路由映射表
- `src/router/index.ts` — 路由实例 + beforeEach 守卫
- `src/layout/AppLayout.vue` — 外层布局容器
- `src/layout/AppSidebar.vue` — 可折叠侧边栏
- `src/layout/AppHeader.vue` — 顶部面包屑 + 用户头像
- `src/layout/AppMain.vue` — router-view 内容区
- `src/views/login/index.vue` — 登录页
- `src/views/dashboard/index.vue` — Dashboard 占位页（Phase 3 填充）
- `src/directives/permission.ts` — v-permission 指令
- `mock/user.ts` — 用户相关 Mock 接口

### 修改文件
- `package.json` — 添加依赖
- `vite.config.ts` — 注册 vite-plugin-mock
- `src/main.ts` — 注册 Pinia、Element Plus、自定义指令

---

## Task 1: 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装运行时依赖**

```bash
npm install pinia axios mockjs echarts
```

- [ ] **Step 2: 安装开发依赖**

```bash
npm install -D vite-plugin-mock @types/mockjs
```

- [ ] **Step 3: 验证安装成功**

```bash
cat package.json | grep -E "pinia|axios|mockjs|echarts|vite-plugin-mock"
```

Expected: 以上包名均出现在输出中。

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install pinia axios mockjs echarts vite-plugin-mock"
```

---

## Task 2: 配置 vite-plugin-mock

**Files:**
- Modify: `vite.config.ts`
- Create: `mock/user.ts`

- [ ] **Step 1: 更新 vite.config.ts**

```typescript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { viteMockServe } from 'vite-plugin-mock'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    viteMockServe({
      mockPath: 'mock',
      enable: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
```

- [ ] **Step 2: 创建 mock/user.ts**

```typescript
import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }: { body: { username: string; password: string } }) => {
      if (body.username === 'admin' && body.password === '123456') {
        return {
          code: 200,
          data: {
            token: Mock.mock('@guid'),
            username: 'admin',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
          },
          message: 'ok',
        }
      }
      return { code: 401, data: null, message: '用户名或密码错误' }
    },
  },
  {
    url: '/api/user/menus',
    method: 'get',
    response: () => ({
      code: 200,
      data: [
        { id: 1, name: 'Dashboard', path: '/dashboard', icon: 'Odometer', component: 'dashboard/index' },
        { id: 2, name: '商品管理', path: '/product', icon: 'Goods', component: 'product/list' },
        { id: 3, name: '商品分类', path: '/product/category', icon: 'Menu', component: 'product/category' },
        { id: 4, name: '订单管理', path: '/order', icon: 'List', component: 'order/list' },
        { id: 5, name: '用户管理', path: '/user', icon: 'User', component: 'user/list' },
        { id: 6, name: '角色管理', path: '/user/role', icon: 'UserFilled', component: 'user/role' },
        { id: 7, name: '菜单管理', path: '/user/menu', icon: 'Grid', component: 'user/menu' },
      ],
      message: 'ok',
    }),
  },
  {
    url: '/api/user/info',
    method: 'get',
    response: () => ({
      code: 200,
      data: {
        username: 'admin',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        roles: ['admin'],
        permissions: ['product:add', 'product:edit', 'product:delete', 'order:ship', 'order:refund'],
      },
      message: 'ok',
    }),
  },
] as MockMethod[]
```

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts mock/user.ts
git commit -m "feat: configure vite-plugin-mock and add user mock"
```

---

## Task 3: 工具函数 + Axios 封装

**Files:**
- Create: `src/utils/auth.ts`
- Create: `src/api/request.ts`
- Create: `src/api/user.ts`

- [ ] **Step 1: 创建 src/utils/auth.ts**

```typescript
const TOKEN_KEY = 'mall_admin_token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
```

- [ ] **Step 2: 创建 src/api/request.ts**

```typescript
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data
    if (code === 200) return data
    ElMessage.error(message || '请求失败')
    return Promise.reject(new Error(message))
  },
  (error) => {
    if (error.response?.status === 401) {
      removeToken()
      window.location.href = '/login'
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
```

- [ ] **Step 3: 创建 src/api/user.ts**

```typescript
import request from './request'

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  username: string
  avatar: string
}

export interface UserInfo {
  username: string
  avatar: string
  roles: string[]
  permissions: string[]
}

export interface MenuItem {
  id: number
  name: string
  path: string
  icon: string
  component: string
}

export function login(data: LoginParams): Promise<LoginResult> {
  return request.post('/user/login', data)
}

export function getUserInfo(): Promise<UserInfo> {
  return request.get('/user/info')
}

export function getMenus(): Promise<MenuItem[]> {
  return request.get('/user/menus')
}
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/auth.ts src/api/request.ts src/api/user.ts
git commit -m "feat: add axios instance and user api"
```

---

## Task 4: Pinia Stores

**Files:**
- Create: `src/stores/app.ts`
- Create: `src/stores/user.ts`
- Create: `src/stores/permission.ts`

- [ ] **Step 1: 创建 src/stores/app.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return { sidebarCollapsed, toggleSidebar }
})
```

- [ ] **Step 2: 创建 src/stores/user.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getUserInfo } from '@/api/user'
import type { LoginParams, UserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(null)

  async function loginAction(params: LoginParams) {
    const result = await login(params)
    token.value = result.token
    setToken(result.token)
  }

  async function fetchUserInfo() {
    userInfo.value = await getUserInfo()
  }

  function logout() {
    token.value = null
    userInfo.value = null
    removeToken()
  }

  return { token, userInfo, loginAction, fetchUserInfo, logout }
})
```

- [ ] **Step 3: 创建 src/stores/permission.ts**

```typescript
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenus } from '@/api/user'
import type { MenuItem } from '@/api/user'
import type { RouteRecordRaw } from 'vue-router'

const viewModules = import.meta.glob('../views/**/*.vue')

function resolveComponent(component: string) {
  const key = `../views/${component}.vue`
  return viewModules[key]
}

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuItem[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])

  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const menuList = await getMenus()
    menus.value = menuList

    const routes: RouteRecordRaw[] = menuList.map((menu) => ({
      path: menu.path,
      name: menu.component.replace('/', '-'),
      component: resolveComponent(menu.component),
      meta: { title: menu.name, icon: menu.icon },
    }))

    dynamicRoutes.value = routes
    return routes
  }

  function resetRoutes() {
    menus.value = []
    dynamicRoutes.value = []
  }

  return { menus, dynamicRoutes, generateRoutes, resetRoutes }
})
```

- [ ] **Step 4: Commit**

```bash
git add src/stores/app.ts src/stores/user.ts src/stores/permission.ts
git commit -m "feat: add pinia stores (app, user, permission)"
```

---

## Task 5: 路由配置 + 守卫

**Files:**
- Create: `src/router/routes.ts`
- Modify: `src/router/index.ts`

- [ ] **Step 1: 创建 src/router/routes.ts**

```typescript
import type { RouteRecordRaw } from 'vue-router'

export const staticRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false },
  },
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/layout/AppLayout.vue'),
    redirect: '/dashboard',
    children: [],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]
```

- [ ] **Step 2: 替换 src/router/index.ts**

```typescript
import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './routes'
import { getToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

let dynamicRoutesLoaded = false

router.beforeEach(async (to, _from, next) => {
  const token = getToken()

  if (!token) {
    if (to.path === '/login') return next()
    return next('/login')
  }

  if (to.path === '/login') return next('/')

  if (!dynamicRoutesLoaded) {
    const { usePermissionStore } = await import('@/stores/permission')
    const { useUserStore } = await import('@/stores/user')
    const permissionStore = usePermissionStore()
    const userStore = useUserStore()

    await userStore.fetchUserInfo()
    const routes = await permissionStore.generateRoutes()

    routes.forEach((route) => {
      router.addRoute('Layout', route)
    })

    dynamicRoutesLoaded = true
    return next({ ...to, replace: true })
  }

  next()
})

export function resetDynamicRoutes() {
  dynamicRoutesLoaded = false
}

export default router
```

- [ ] **Step 3: Commit**

```bash
git add src/router/routes.ts src/router/index.ts
git commit -m "feat: add router with auth guard and dynamic route loading"
```

---

## Task 6: 布局组件

**Files:**
- Create: `src/layout/AppMain.vue`
- Create: `src/layout/AppHeader.vue`
- Create: `src/layout/AppSidebar.vue`
- Create: `src/layout/AppLayout.vue`

- [ ] **Step 1: 创建 src/layout/AppMain.vue**

```vue
<template>
  <el-main class="app-main">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </el-main>
</template>

<style scoped>
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f0f2f5;
}
</style>
```

- [ ] **Step 2: 创建 src/layout/AppHeader.vue**

```vue
<template>
  <el-header class="app-header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar()">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <span class="user-info">
          <el-avatar :size="32" :src="userStore.userInfo?.avatar" />
          <span class="username">{{ userStore.userInfo?.username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Fold, Expand } from '@element-plus/icons-vue'
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
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 16px;
  height: 56px;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.collapse-btn { font-size: 20px; cursor: pointer; }
.header-right { display: flex; align-items: center; }
.user-info { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.username { font-size: 14px; }
</style>
```

- [ ] **Step 3: 创建 src/layout/AppSidebar.vue**

```vue
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
```

- [ ] **Step 4: 创建 src/layout/AppLayout.vue**

```vue
<template>
  <el-container class="app-layout">
    <AppSidebar />
    <el-container direction="vertical">
      <AppHeader />
      <AppMain />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppMain from './AppMain.vue'
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
}
</style>
```

- [ ] **Step 5: Commit**

```bash
git add src/layout/
git commit -m "feat: add layout components (sidebar, header, main)"
```

---

## Task 7: 登录页

**Files:**
- Create: `src/views/login/index.vue`

- [ ] **Step 1: 创建 src/views/login/index.vue**

```vue
<template>
  <div class="login-page">
    <el-card class="login-card">
      <h2 class="title">商城后台管理系统</h2>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="admin" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="123456" show-password />
        </el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          style="width: 100%"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({ username: '', password: '' })

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value?.validate()
  loading.value = true
  try {
    await userStore.loginAction(form)
    router.push('/')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.login-card { width: 400px; }
.title { text-align: center; margin-bottom: 24px; font-size: 20px; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/views/login/index.vue
git commit -m "feat: add login page"
```

---

## Task 8: Dashboard 占位页 + v-permission 指令 + 引导 main.ts

**Files:**
- Create: `src/views/dashboard/index.vue`
- Create: `src/directives/permission.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: 创建 src/views/dashboard/index.vue**

```vue
<template>
  <div>
    <h2>数据看板</h2>
    <p>Dashboard 内容将在 Phase 3 实现</p>
  </div>
</template>
```

- [ ] **Step 2: 创建 src/directives/permission.ts**

```typescript
import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const permissions = userStore.userInfo?.permissions ?? []
    const required = Array.isArray(binding.value) ? binding.value : [binding.value]
    const hasPermission = required.some((p) => permissions.includes(p))
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  },
}

export default permission
```

- [ ] **Step 3: 替换 src/main.ts**

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import permission from './directives/permission'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.directive('permission', permission)

app.mount('#app')
```

- [ ] **Step 4: Commit**

```bash
git add src/views/dashboard/index.vue src/directives/permission.ts src/main.ts
git commit -m "feat: add dashboard placeholder, v-permission directive, bootstrap app"
```

---

## Task 9: 端到端验证

- [ ] **Step 1: 启动开发服务器**

```bash
npm run dev
```

在浏览器打开 `http://localhost:5173`

- [ ] **Step 2: 验证登录流程**

1. 应自动跳转到 `/login`
2. 输入 `admin` / `123456` 点击登录
3. 应跳转到 `/dashboard` 并显示侧边栏菜单（7 个菜单项）

- [ ] **Step 3: 验证侧边栏折叠**

点击 Header 左侧折叠按钮，侧边栏应收起为图标模式（64px 宽）

- [ ] **Step 4: 验证退出登录**

点击右上角用户名 → 退出登录，应跳回 `/login`，再次访问 `/dashboard` 应被拦截跳回登录页

- [ ] **Step 5: 验证 TypeScript**

```bash
npm run type-check
```

Expected: 无 TypeScript 错误

---

## Phase 3-6 预告

后续计划将在实施时按需展开：

- **Phase 3** — Dashboard（ECharts 图表、统计卡片）
- **Phase 4** — 商品管理（列表、表单、分类树）
- **Phase 5** — 订单管理（列表、详情、发货、退款）
- **Phase 6** — 用户管理 + RBAC（用户、角色、菜单权限配置）
