import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

const permission: Directive<HTMLElement, string | string[]> = {
  mounted(el, binding) {
    const userStore = useUserStore()
    const permissions = userStore.userInfo?.permissions ?? []
    if (!userStore.userInfo) {
      console.warn('[v-permission] userInfo is null at mount time — element will be hidden')
    }
    const required = Array.isArray(binding.value) ? binding.value : [binding.value]
    const hasPermission = required.some((p) => permissions.includes(p))
    if (!hasPermission) {
      el.parentNode?.removeChild(el)
    }
  },
}

export default permission
