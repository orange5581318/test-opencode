import request from './request'

export interface StatItem {
  value: number
  trend: number
}

export interface DashboardStats {
  totalSales: StatItem
  orderCount: StatItem
  userCount: StatItem
  productCount: StatItem
}

export interface SalesTrend {
  dates: string[]
  values: number[]
}

export interface CategoryStat {
  name: string
  value: number
}

export interface RecentOrder {
  id: string
  productName: string
  amount: number
  status: 'pending' | 'paid' | 'shipped' | 'refunded'
  createdAt: string
}

/** 获取仪表盘统计数据 */
export function getDashboardStats(): Promise<DashboardStats> {
  return request.get('/dashboard/stats')
}

/** 获取近7天销售趋势 */
export function getSalesTrend(): Promise<SalesTrend> {
  return request.get('/dashboard/salesTrend')
}

/** 获取各分类商品销量统计 */
export function getCategoryStats(): Promise<CategoryStat[]> {
  return request.get('/dashboard/categoryStats')
}

/** 获取最新订单列表 */
export function getRecentOrders(): Promise<RecentOrder[]> {
  return request.get('/dashboard/recentOrders')
}
