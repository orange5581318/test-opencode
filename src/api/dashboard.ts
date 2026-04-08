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

export function getDashboardStats(): Promise<DashboardStats> {
  return request.get('/dashboard/stats')
}

export function getSalesTrend(): Promise<SalesTrend> {
  return request.get('/dashboard/salesTrend')
}

export function getCategoryStats(): Promise<CategoryStat[]> {
  return request.get('/dashboard/categoryStats')
}

export function getRecentOrders(): Promise<RecentOrder[]> {
  return request.get('/dashboard/recentOrders')
}
