import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

export default [
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
        { id: 5, name: '用户管理', path: '/user', icon: 'User', component: 'user/list' },
        { id: 6, name: '角色管理', path: '/user/role', icon: 'UserFilled', component: 'user/role' },
        { id: 7, name: '菜单管理', path: '/user/menu', icon: 'Grid', component: 'user/menu' },
      ],
      message: 'ok',
    }),
  },
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
