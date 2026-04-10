import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getMenus } from '@/api/user'
import type { MenuItem } from '@/api/user'
import type { RouteRecordRaw } from 'vue-router'

const viewModules = import.meta.glob('../views/**/*.vue')

/** 根据路径字符串动态解析 Vue 组件 */
function resolveComponent(component: string) {
  const key = `../views/${component}.vue`
  const mod = viewModules[key]
  if (!mod) {
    console.warn(`[permission] No view found for component: "${component}"`)
    return () => import('../views/dashboard/index.vue')
  }
  return mod
}

export const usePermissionStore = defineStore('permission', () => {
  const menus = ref<MenuItem[]>([])
  const dynamicRoutes = ref<RouteRecordRaw[]>([])

  /** 根据菜单数据生成动态路由并注册 */
  async function generateRoutes(): Promise<RouteRecordRaw[]> {
    const menuList = await getMenus()
    menus.value = menuList

    const routes: RouteRecordRaw[] = menuList.map((menu) => ({
      path: menu.path,
      name: menu.component.replace('/', '-'),
      component: resolveComponent(menu.component),
      meta: { title: menu.name, icon: menu.icon, hidden: menu.hidden || false },
    }))

    dynamicRoutes.value = routes
    return routes
  }

  /** 重置动态路由，清空菜单数据 */
  function resetRoutes() {
    menus.value = []
    dynamicRoutes.value = []
  }

  return { menus, dynamicRoutes, generateRoutes, resetRoutes }
})
