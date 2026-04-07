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
