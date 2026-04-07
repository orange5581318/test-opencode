import { createRouter, createWebHistory } from 'vue-router'
import { staticRoutes } from './routes'
import { getToken } from '@/utils/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: staticRoutes,
})

let dynamicRoutesLoaded = false
let addedRouteNames: string[] = []

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
      if (route.name) addedRouteNames.push(route.name as string)
    })

    dynamicRoutesLoaded = true
    return next({ ...to, replace: true })
  }

  next()
})

export function resetDynamicRoutes() {
  addedRouteNames.forEach((name) => router.removeRoute(name))
  addedRouteNames = []
  dynamicRoutesLoaded = false
}

export default router
