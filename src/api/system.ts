import request from './request'

// ==================== User ====================
export interface SystemUser {
  id: number
  username: string
  nickname: string
  email: string
  phone: string
  avatar: string
  status: number
  roleIds: number[]
  roleName: string
  createTime: string
}

export interface SystemUserForm {
  username: string
  nickname: string
  email: string
  phone: string
  status: number
  roleIds: number[]
}

export interface SystemUserListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: number | ''
}

export interface SystemUserListResult {
  list: SystemUser[]
  total: number
}

export function getSystemUserList(params: SystemUserListParams) {
  return request.get<any, SystemUserListResult>('/system/user/list', { params })
}

export function addSystemUser(data: SystemUserForm) {
  return request.post<any, null>('/system/user/add', data)
}

export function updateSystemUser(data: SystemUserForm & { id: number }) {
  return request.post<any, null>('/system/user/update', data)
}

export function deleteSystemUser(id: number) {
  return request.post<any, null>('/system/user/delete', { id })
}

export function toggleSystemUserStatus(id: number, status: number) {
  return request.post<any, null>('/system/user/toggleStatus', { id, status })
}

// ==================== Role ====================
export interface Role {
  id: number
  name: string
  code: string
  description: string
  permissionIds: number[]
  status: number
  createTime: string
}

export interface RoleForm {
  name: string
  code: string
  description: string
  status: number
  permissionIds: number[]
}

export interface RoleListParams {
  page: number
  pageSize: number
  keyword?: string
  status?: number | ''
}

export interface RoleListResult {
  list: Role[]
  total: number
}

export function getRoleList(params: RoleListParams) {
  return request.get<any, RoleListResult>('/system/role/list', { params })
}

export function getAllRoles() {
  return request.get<any, Role[]>('/system/role/all')
}

export function addRole(data: RoleForm) {
  return request.post<any, null>('/system/role/add', data)
}

export function updateRole(data: RoleForm & { id: number }) {
  return request.post<any, null>('/system/role/update', data)
}

export function deleteRole(id: number) {
  return request.post<any, null>('/system/role/delete', { id })
}

// ==================== Menu ====================
export interface SystemMenu {
  id: number
  name: string
  path: string
  icon: string
  component: string
  sort: number
  status: number
  hidden: boolean
  createTime: string
}

export interface SystemMenuForm {
  name: string
  path: string
  icon: string
  component: string
  sort: number
  status: number
  hidden: boolean
}

export function getSystemMenuList() {
  return request.get<any, SystemMenu[]>('/system/menu/list')
}

export function addSystemMenu(data: SystemMenuForm) {
  return request.post<any, null>('/system/menu/add', data)
}

export function updateSystemMenu(data: SystemMenuForm & { id: number }) {
  return request.post<any, null>('/system/menu/update', data)
}

export function deleteSystemMenu(id: number) {
  return request.post<any, null>('/system/menu/delete', { id })
}
