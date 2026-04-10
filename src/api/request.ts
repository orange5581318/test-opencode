/**
 * Axios 请求封装模块
 * 统一处理请求拦截（Token 注入）和响应拦截（错误提示、401 跳转登录）
 */
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'

const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

/** 请求拦截器：自动在请求头中注入 Token */
request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/** 响应拦截器：统一处理响应数据、错误提示及 401 自动跳转登录 */
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
      import('@/router').then(({ default: router }) => {
        router.push('/login')
      })
    }
    ElMessage.error(error.message || '网络错误')
    return Promise.reject(error)
  }
)

export default request
