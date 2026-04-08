import type { MockMethod } from 'vite-plugin-mock'
import Mock from 'mockjs'

function generateOrderNo() {
  const date = Mock.mock('@date("yyyyMMdd")')
  const rand = Mock.mock('@string("number", 6)')
  return `ORD${date}${rand}`
}

function generateItems() {
  const count = Mock.mock('@integer(1, 3)')
  const items: any[] = []
  for (let i = 0; i < count; i++) {
    const price = parseFloat(Mock.mock('@float(10, 500, 1, 2)'))
    const quantity = Mock.mock('@integer(1, 5)')
    items.push({
      id: i + 1,
      name: Mock.mock('@ctitle(2, 6)'),
      image: `https://picsum.photos/seed/item${Mock.mock('@integer(1, 200)')}/80/80`,
      price,
      quantity,
      subtotal: parseFloat((price * quantity).toFixed(2)),
    })
  }
  return items
}

function generateOrders() {
  const list: any[] = []
  for (let i = 1; i <= 50; i++) {
    const status = Mock.mock('@integer(0, 5)')
    const items = generateItems()
    const totalAmount = parseFloat(items.reduce((sum: number, it: any) => sum + it.subtotal, 0).toFixed(2))
    const itemCount = items.reduce((sum: number, it: any) => sum + it.quantity, 0)
    const createTime = Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')

    const order: any = {
      id: i,
      orderNo: generateOrderNo(),
      username: Mock.mock('@cname'),
      phone: Mock.mock(/^1[3-9]\d{9}$/),
      address: Mock.mock('@county(true)') + Mock.mock('@ctitle(3, 5)') + '路' + Mock.mock('@integer(1, 200)') + '号',
      status,
      totalAmount,
      itemCount,
      items,
      expressNo: '',
      remark: Mock.mock('@cparagraph(1)'),
      createTime,
      payTime: '',
      shipTime: '',
      refundReason: '',
    }

    // Make time fields and expressNo consistent with status
    if (status >= 1) {
      // 待发货及以上状态都已付款
      order.payTime = Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')
    }
    if (status === 2 || status === 3) {
      // 已发货 / 已完成
      order.expressNo = 'SF' + Mock.mock('@string("number", 12)')
      order.shipTime = Mock.mock('@datetime("yyyy-MM-dd HH:mm:ss")')
    }
    if (status === 4) {
      // 已退款
      order.refundReason = Mock.mock('@cparagraph(1)')
    }

    list.push(order)
  }
  return list
}

const allOrders = generateOrders()

export default [
  {
    url: '/api/order/list',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const page = parseInt(query.page || '1')
      const pageSize = parseInt(query.pageSize || '10')
      const orderNo = (query.orderNo || '').trim()
      const status = query.status !== undefined && query.status !== '' ? parseInt(query.status) : undefined
      const startDate = query.startDate || ''
      const endDate = query.endDate || ''

      let filtered = allOrders.filter((o) => {
        if (orderNo && !o.orderNo.includes(orderNo)) return false
        if (status !== undefined && o.status !== status) return false
        if (startDate && o.createTime < startDate) return false
        if (endDate && o.createTime > endDate + ' 23:59:59') return false
        return true
      })

      const total = filtered.length
      const list = filtered.slice((page - 1) * pageSize, page * pageSize)
      return { code: 200, data: { list, total }, message: 'ok' }
    },
  },
  {
    url: '/api/order/detail',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const id = parseInt(query.id)
      const order = allOrders.find((o) => o.id === id)
      return { code: 200, data: order || null, message: order ? 'ok' : '订单不存在' }
    },
  },
  {
    url: '/api/order/ship',
    method: 'post',
    response: ({ body }: { body: { id: number; expressNo: string } }) => {
      const order = allOrders.find((o) => o.id === body.id)
      if (order) {
        order.status = 2
        order.expressNo = body.expressNo
        order.shipTime = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')
      }
      return { code: 200, data: null, message: '发货成功' }
    },
  },
  {
    url: '/api/order/refund',
    method: 'post',
    response: ({ body }: { body: { id: number; reason: string } }) => {
      const order = allOrders.find((o) => o.id === body.id)
      if (order) {
        order.status = 4
        order.refundReason = body.reason
      }
      return { code: 200, data: null, message: '退款成功' }
    },
  },
] as MockMethod[]
