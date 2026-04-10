import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
  // 用户登录
  {
    url: '/api/user/login',
    method: 'post',
    response: ({ body }: { body: { username: string; password: string } }) => {
      if (body.username === 'admin' && body.password === '123456') {
        return {
          code: 200,
          data: {
            token: Mock.mock('@guid'),
            username: 'admin',
            avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
          },
          message: 'ok',
        }
      }
      return { code: 401, data: null, message: '用户名或密码错误' }
    },
  },
  // 获取用户菜单权限
  {
    url: '/api/user/menus',
    method: 'get',
    response: () => ({
      code: 200,
      data: [
        { id: 1, name: 'Dashboard', path: '/dashboard', icon: 'Odometer', component: 'dashboard/index' },
        { id: 2, name: '商品管理', path: '/product', icon: 'Goods', component: 'product/list' },
        { id: 3, name: '商品分类', path: '/product/category', icon: 'Menu', component: 'product/category' },
        { id: 4, name: '订单管理', path: '/order', icon: 'List', component: 'order/list' },
        { id: 8, name: '订单详情', path: '/order/detail', icon: 'Document', component: 'order/detail', hidden: true },
        { id: 5, name: '用户管理', path: '/user', icon: 'User', component: 'user/list' },
        { id: 6, name: '角色管理', path: '/user/role', icon: 'UserFilled', component: 'user/role' },
        { id: 7, name: '菜单管理', path: '/user/menu', icon: 'Grid', component: 'user/menu' },
      ],
      message: 'ok',
    }),
  },
  // 获取当前用户信息
  {
    url: '/api/user/info',
    method: 'get',
    response: () => ({
      code: 200,
      data: {
        username: 'admin',
        avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
        roles: ['admin'],
        permissions: ['product:add', 'product:edit', 'product:delete', 'order:ship', 'order:refund'],
      },
      message: 'ok',
    }),
  },
] as MockMethod[]
