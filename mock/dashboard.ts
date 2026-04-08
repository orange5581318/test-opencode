import type { MockMethod } from 'vite-plugin-mock'

export default [
  {
    url: '/api/dashboard/stats',
    method: 'get',
    response: () => ({
      code: 200,
      data: {
        totalSales: { value: 128560, trend: 12.5 },
        orderCount: { value: 3842, trend: -3.2 },
        userCount: { value: 21480, trend: 8.1 },
        productCount: { value: 654, trend: 2.4 },
      },
      message: 'ok',
    }),
  },
  {
    url: '/api/dashboard/salesTrend',
    method: 'get',
    response: () => ({
      code: 200,
      data: {
        dates: ['04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07'],
        values: [12800, 15200, 9800, 18400, 21000, 16500, 14900],
      },
      message: 'ok',
    }),
  },
  {
    url: '/api/dashboard/categoryStats',
    method: 'get',
    response: () => ({
      code: 200,
      data: [
        { name: '手机数码', value: 1240 },
        { name: '服装鞋帽', value: 980 },
        { name: '家居生活', value: 760 },
        { name: '食品饮料', value: 1560 },
        { name: '运动户外', value: 430 },
        { name: '图书文具', value: 290 },
      ],
      message: 'ok',
    }),
  },
  {
    url: '/api/dashboard/recentOrders',
    method: 'get',
    response: () => ({
      code: 200,
      data: [
        { id: 'ORD-20240407-001', productName: 'iPhone 15 Pro', amount: 8999, status: 'paid', createdAt: '2026-04-07 09:12:33' },
        { id: 'ORD-20240407-002', productName: '耐克运动鞋', amount: 699, status: 'shipped', createdAt: '2026-04-07 08:55:10' },
        { id: 'ORD-20240407-003', productName: '小米电视 65寸', amount: 3299, status: 'pending', createdAt: '2026-04-07 08:30:45' },
        { id: 'ORD-20240407-004', productName: '雀巢咖啡礼盒', amount: 128, status: 'paid', createdAt: '2026-04-07 07:48:22' },
        { id: 'ORD-20240407-005', productName: '瑜伽垫套装', amount: 259, status: 'refunded', createdAt: '2026-04-06 23:15:08' },
      ],
      message: 'ok',
    }),
  },
] as MockMethod[]
