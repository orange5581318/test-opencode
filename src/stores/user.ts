import { defineStore } from 'pinia'
import { ref } from 'vue'
import { login, getUserInfo } from '@/api/user'
import type { LoginParams, UserInfo } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref<string | null>(getToken())
  const userInfo = ref<UserInfo | null>(null)

  /** 执行用户登录并保存 token */
  async function loginAction(params: LoginParams) {
    const result = await login(params)
    token.value = result.token
    setToken(result.token)
  }

  /** 获取并缓存当前用户信息 */
  async function fetchUserInfo() {
    userInfo.value = await getUserInfo()
  }

  /** 退出登录，清除 token 和用户信息 */
  function logout() {
    token.value = null
    userInfo.value = null
    removeToken()
  }

  return { token, userInfo, loginAction, fetchUserInfo, logout }
})
