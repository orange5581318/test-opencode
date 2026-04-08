import request from './request'

export interface OrderItem {
  id: number
  name: string
  image: string
  price: number
  quantity: number
  subtotal: number
}

export interface Order {
  id: number
  orderNo: string
  username: string
  phone: string
  address: string
  status: number
  totalAmount: number
  itemCount: number
  items: OrderItem[]
  expressNo: string
  remark: string
  createTime: string
  payTime: string
  shipTime: string
  refundReason?: string
}

export interface OrderListParams {
  page: number
  pageSize: number
  orderNo?: string
  status?: number | ''
  startDate?: string
  endDate?: string
}

export interface OrderListResult {
  list: Order[]
  total: number
}

export function getOrderList(params: OrderListParams) {
  return request.get<any, OrderListResult>('/order/list', { params })
}

export function getOrderDetail(id: number) {
  return request.get<any, Order>('/order/detail', { params: { id } })
}

export function shipOrder(id: number, expressNo: string) {
  return request.post<any, null>('/order/ship', { id, expressNo })
}

export function refundOrder(id: number, reason: string) {
  return request.post<any, null>('/order/refund', { id, reason })
}
