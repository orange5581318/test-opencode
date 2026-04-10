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

/** 获取系统用户列表（分页） */
export function getSystemUserList(params: SystemUserListParams) {
  return request.get<any, SystemUserListResult>('/system/user/list', { params })
}

/** 新增系统用户 */
export function addSystemUser(data: SystemUserForm) {
  return request.post<any, null>('/system/user/add', data)
}

/** 更新系统用户信息 */
export function updateSystemUser(data: SystemUserForm & { id: number }) {
  return request.post<any, null>('/system/user/update', data)
}

/** 删除系统用户 */
export function deleteSystemUser(id: number) {
  return request.post<any, null>('/system/user/delete', { id })
}

/** 切换系统用户启用/禁用状态 */
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

/** 获取角色列表（分页） */
export function getRoleList(params: RoleListParams) {
  return request.get<any, RoleListResult>('/system/role/list', { params })
}

/** 获取全部角色（不分页，用于下拉选择） */
export function getAllRoles() {
  return request.get<any, Role[]>('/system/role/all')
}

/** 新增角色 */
export function addRole(data: RoleForm) {
  return request.post<any, null>('/system/role/add', data)
}

/** 更新角色信息 */
export function updateRole(data: RoleForm & { id: number }) {
  return request.post<any, null>('/system/role/update', data)
}

/** 删除角色 */
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

/** 获取系统菜单列表 */
export function getSystemMenuList() {
  return request.get<any, SystemMenu[]>('/system/menu/list')
}

/** 新增系统菜单 */
export function addSystemMenu(data: SystemMenuForm) {
  return request.post<any, null>('/system/menu/add', data)
}

/** 更新系统菜单 */
export function updateSystemMenu(data: SystemMenuForm & { id: number }) {
  return request.post<any, null>('/system/menu/update', data)
}

/** 删除系统菜单 */
export function deleteSystemMenu(id: number) {
  return request.post<any, null>('/system/menu/delete', { id })
}
