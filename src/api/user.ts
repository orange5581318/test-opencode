import request from './request'

export interface LoginParams {
  userName: string
  password: string
}

export interface LoginResult {
  token: string
  userName: string
  avatar: string
}

export interface UserInfo {
  userName: string
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
  hidden?: boolean
}

/** 用户登录 */
export function login(data: LoginParams): Promise<LoginResult> {
  return request.post('/user/login', data)
}

/** 获取当前用户信息 */
export function getUserInfo(): Promise<UserInfo> {
  return request.get('/user/info')
}

/** 获取用户菜单权限列表 */
export function getMenus(): Promise<MenuItem[]> {
  return request.get('/user/menus')
}
