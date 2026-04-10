import type { Directive } from 'vue'
import { useUserStore } from '@/stores/user'

/**
 * v-permission 指令：根据用户权限控制元素的显示与隐藏
 * 若用户不具备所需权限，则从 DOM 中移除该元素
 */
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
