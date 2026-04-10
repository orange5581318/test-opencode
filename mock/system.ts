import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

// ==================== Menus ====================
const allMenus: any[] = [
  { id: 1, name: 'Dashboard', path: '/dashboard', icon: 'Odometer', component: 'views/dashboard/index', sort: 1, status: 1, hidden: false, createTime: '2025-01-01 08:00:00' },
  { id: 2, name: '商品管理', path: '/product', icon: 'Goods', component: 'views/product/index', sort: 2, status: 1, hidden: false, createTime: '2025-01-02 09:00:00' },
  { id: 3, name: '商品分类', path: '/product/category', icon: 'Grid', component: 'views/product/category', sort: 3, status: 1, hidden: false, createTime: '2025-01-02 10:00:00' },
  { id: 4, name: '订单管理', path: '/order', icon: 'List', component: 'views/order/index', sort: 4, status: 1, hidden: false, createTime: '2025-01-03 09:00:00' },
  { id: 5, name: '订单详情', path: '/order/detail', icon: 'Document', component: 'views/order/detail', sort: 5, status: 1, hidden: true, createTime: '2025-01-03 10:00:00' },
  { id: 6, name: '用户管理', path: '/system/user', icon: 'User', component: 'views/system/user', sort: 6, status: 1, hidden: false, createTime: '2025-01-04 09:00:00' },
  { id: 7, name: '角色管理', path: '/system/role', icon: 'UserFilled', component: 'views/system/role', sort: 7, status: 1, hidden: false, createTime: '2025-01-04 10:00:00' },
  { id: 8, name: '菜单管理', path: '/system/menu', icon: 'Menu', component: 'views/system/menu', sort: 8, status: 1, hidden: false, createTime: '2025-01-04 11:00:00' },
]

let menuIdCounter = 8

// ==================== Roles ====================
const allRoles: any[] = [
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有所有权限', permissionIds: [1, 2, 3, 4, 5, 6, 7, 8], status: 1, createTime: '2025-01-01 08:00:00' },
  { id: 2, name: '商品管理员', code: 'product_admin', description: '商品相关权限', permissionIds: [1, 2, 3], status: 1, createTime: '2025-01-02 08:00:00' },
  { id: 3, name: '订单管理员', code: 'order_admin', description: '订单相关权限', permissionIds: [1, 4, 8], status: 1, createTime: '2025-01-03 08:00:00' },
  { id: 4, name: '普通用户', code: 'user', description: '基础查看权限', permissionIds: [1], status: 1, createTime: '2025-01-04 08:00:00' },
  { id: 5, name: '访客', code: 'guest', description: '仅查看Dashboard', permissionIds: [1], status: 0, createTime: '2025-01-05 08:00:00' },
]

let roleIdCounter = 5

// ==================== Users ====================
/** 根据角色ID数组获取角色名称 */
function getRoleName(roleIds: number[]) {
  return roleIds
    .map((rid) => allRoles.find((r) => r.id === rid)?.name || '')
    .filter(Boolean)
    .join(',')
}

/** 随机生成角色ID组合 */
function randomRoleIds(): number[] {
  const count = Mock.mock('@integer(1, 2)')
  const ids = new Set<number>()
  while (ids.size < count) {
    ids.add(Mock.mock('@integer(1, 5)'))
  }
  return Array.from(ids)
}

/** 批量生成模拟用户数据 */
function generateUsers() {
  const list: any[] = []
  for (let i = 1; i <= 30; i++) {
    const roleIds = randomRoleIds()
    list.push({
      id: i,
      username: Mock.mock('@word(4, 8)'),
      nickname: Mock.mock('@cname'),
      email: Mock.mock('@email'),
      phone: Mock.mock(/^1[3-9]\d{9}$/),
      avatar: `https://picsum.photos/seed/user${i}/80/80`,
      status: i % 7 === 0 ? 0 : 1,
      roleIds,
      roleName: getRoleName(roleIds),
      createTime: Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")'),
    })
  }
  return list
}

const allUsers = generateUsers()
let userIdCounter = 30

// ==================== Endpoints ====================
export default [
  // ---------- User Management ----------
  // 用户列表（分页、筛选）
  {
    url: '/api/system/user/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const page = parseInt(query.page || '1')
      const pageSize = parseInt(query.pageSize || '10')
      const keyword = (query.keyword || '').trim().toLowerCase()
      const status = query.status !== undefined && query.status !== '' ? parseInt(query.status) : undefined

      let filtered = allUsers.filter((u) => {
        if (keyword && !u.username.toLowerCase().includes(keyword) && !u.nickname.toLowerCase().includes(keyword)) return false
        if (status !== undefined && u.status !== status) return false
        return true
      })

      const total = filtered.length
      const list = filtered.slice((page - 1) * pageSize, page * pageSize)
      return { code: 200, data: { list, total }, message: 'ok' }
    },
  },
  // 新增用户
  {
    url: '/api/system/user/add',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const roleIds: number[] = body.roleIds || []
      const newUser = {
        id: ++userIdCounter,
        username: body.username,
        nickname: body.nickname,
        email: body.email,
        phone: body.phone,
        avatar: `https://picsum.photos/seed/user${userIdCounter}/80/80`,
        status: body.status ?? 1,
        roleIds,
        roleName: getRoleName(roleIds),
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      }
      allUsers.unshift(newUser)
      return { code: 200, data: newUser, message: '新增成功' }
    },
  },
  // 更新用户信息
  {
    url: '/api/system/user/update',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const idx = allUsers.findIndex((u) => u.id === body.id)
      if (idx !== -1) {
        const roleIds: number[] = body.roleIds || allUsers[idx].roleIds
        allUsers[idx] = { ...allUsers[idx], ...body, roleIds, roleName: getRoleName(roleIds) }
      }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  // 删除用户
  {
    url: '/api/system/user/delete',
    method: 'post',
    response: ({ body }: { body: { id: number } }) => {
      const idx = allUsers.findIndex((u) => u.id === body.id)
      if (idx !== -1) allUsers.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },
  // 切换用户启用/禁用状态
  {
    url: '/api/system/user/toggleStatus',
    method: 'post',
    response: ({ body }: { body: { id: number; status: number } }) => {
      const user = allUsers.find((u) => u.id === body.id)
      if (user) user.status = body.status
      return { code: 200, data: null, message: '状态更新成功' }
    },
  },
  // ---------- Role Management ----------
  // 角色列表（分页、筛选）
  {
    url: '/api/system/role/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const page = parseInt(query.page || '1')
      const pageSize = parseInt(query.pageSize || '10')
      const keyword = (query.keyword || '').trim().toLowerCase()
      const status = query.status !== undefined && query.status !== '' ? parseInt(query.status) : undefined

      let filtered = allRoles.filter((r) => {
        if (keyword && !r.name.toLowerCase().includes(keyword) && !r.code.toLowerCase().includes(keyword)) return false
        if (status !== undefined && r.status !== status) return false
        return true
      })

      const total = filtered.length
      const list = filtered.slice((page - 1) * pageSize, page * pageSize)
      return { code: 200, data: { list, total }, message: 'ok' }
    },
  },
  // 获取全部角色（不分页）
  {
    url: '/api/system/role/all',
    method: 'get',
    response: () => {
      return { code: 200, data: allRoles, message: 'ok' }
    },
  },
  // 新增角色
  {
    url: '/api/system/role/add',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newRole = {
        id: ++roleIdCounter,
        name: body.name,
        code: body.code,
        description: body.description || '',
        status: body.status ?? 1,
        permissionIds: body.permissionIds || [],
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      }
      allRoles.push(newRole)
      return { code: 200, data: newRole, message: '新增成功' }
    },
  },
  // 更新角色信息
  {
    url: '/api/system/role/update',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const idx = allRoles.findIndex((r) => r.id === body.id)
      if (idx !== -1) {
        allRoles[idx] = { ...allRoles[idx], ...body }
      }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  // 删除角色
  {
    url: '/api/system/role/delete',
    method: 'post',
    response: ({ body }: { body: { id: number } }) => {
      const idx = allRoles.findIndex((r) => r.id === body.id)
      if (idx !== -1) allRoles.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },
  // ---------- Menu Management ----------
  // 获取菜单列表
  {
    url: '/api/system/menu/list',
    method: 'get',
    response: () => {
      return { code: 200, data: allMenus, message: 'ok' }
    },
  },
  // 新增菜单
  {
    url: '/api/system/menu/add',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const newMenu = {
        id: ++menuIdCounter,
        name: body.name,
        path: body.path,
        icon: body.icon || '',
        component: body.component || '',
        sort: body.sort ?? allMenus.length + 1,
        status: body.status ?? 1,
        hidden: body.hidden ?? false,
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      }
      allMenus.push(newMenu)
      return { code: 200, data: newMenu, message: '新增成功' }
    },
  },
  // 更新菜单信息
  {
    url: '/api/system/menu/update',
    method: 'post',
    response: ({ body }: { body: any }) => {
      const idx = allMenus.findIndex((m) => m.id === body.id)
      if (idx !== -1) {
        allMenus[idx] = { ...allMenus[idx], ...body }
      }
      return { code: 200, data: null, message: '更新成功' }
    },
  },
  // 删除菜单
  {
    url: '/api/system/menu/delete',
    method: 'post',
    response: ({ body }: { body: { id: number } }) => {
      const idx = allMenus.findIndex((m) => m.id === body.id)
      if (idx !== -1) allMenus.splice(idx, 1)
      return { code: 200, data: null, message: '删除成功' }
    },
  },
] as MockMethod[]
