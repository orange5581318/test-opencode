import { createRouter, createWebHashHistory  } from 'vue-router'
import { staticRoutes } from './routes'
import { getToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHashHistory (import.meta.env.BASE_URL),
  routes: staticRoutes,
})

let dynamicRoutesLoaded = false
let addedRouteNames: string[] = []

router.beforeEach(async (to) => {
  const token = getToken()

  if (!token) {
    if (to.path === '/login') return true
    return '/login'
  }

  if (to.path === '/login') return '/'

  if (!dynamicRoutesLoaded) {
    const { usePermissionStore } = await import('@/stores/permission')
    const { useUserStore } = await import('@/stores/user')
    const permissionStore = usePermissionStore()
    const userStore = useUserStore()

    await userStore.fetchUserInfo()
    const routes = await permissionStore.generateRoutes()

    routes.forEach((route) => {
      router.addRoute('Layout', route)
      if (route.name) addedRouteNames.push(route.name as string)
    })

    dynamicRoutesLoaded = true
    // re-navigate so the newly added routes are matched
    // if the target route still doesn't exist, fall back to /dashboard
    const exists = router.resolve(to).matched.length > 0
    return exists
      ? { path: to.path, query: to.query, hash: to.hash, replace: true }
      : '/dashboard'
  }

  return true
})

/** 移除所有动态添加的路由 */
export function resetDynamicRoutes() {
  addedRouteNames.forEach((name) => router.removeRoute(name))
  addedRouteNames = []
  dynamicRoutesLoaded = false
}

export default router
