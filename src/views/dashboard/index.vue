<template>
  <div class="dashboard">
    <div class="stats-row">
      <StatsCard icon="Money" icon-bg="#409eff" label="总销售额"
        :value="stats?.totalSales.value ?? 0" :trend="stats?.totalSales.trend ?? 0" />
      <StatsCard icon="List" icon-bg="#67c23a" label="订单数"
        :value="stats?.orderCount.value ?? 0" :trend="stats?.orderCount.trend ?? 0" />
      <StatsCard icon="User" icon-bg="#e6a23c" label="用户数"
        :value="stats?.userCount.value ?? 0" :trend="stats?.userCount.trend ?? 0" />
      <StatsCard icon="Goods" icon-bg="#f56c6c" label="商品数"
        :value="stats?.productCount.value ?? 0" :trend="stats?.productCount.trend ?? 0" />
    </div>

    <div class="charts-row">
      <div class="chart-col"><SalesChart :data="salesTrend" /></div>
      <div class="chart-col"><CategoryChart :data="categoryStats" /></div>
    </div>

    <el-card shadow="hover" class="orders-card">
      <template #header><span>最新订单</span></template>
      <el-table :data="recentOrders" stripe style="width: 100%">
        <el-table-column prop="id" label="订单号" min-width="180" />
        <el-table-column prop="productName" label="商品名" min-width="140" />
        <el-table-column label="金额" min-width="100">
          <template #default="{ row }">¥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="90">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="时间" min-width="160" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatsCard from './components/StatsCard.vue'
import SalesChart from './components/SalesChart.vue'
import CategoryChart from './components/CategoryChart.vue'
import {
  getDashboardStats, getSalesTrend, getCategoryStats, getRecentOrders,
} from '@/api/dashboard'
import type { DashboardStats, SalesTrend, CategoryStat, RecentOrder } from '@/api/dashboard'

const stats = ref<DashboardStats | null>(null)
const salesTrend = ref<SalesTrend | null>(null)
const categoryStats = ref<CategoryStat[]>([])
const recentOrders = ref<RecentOrder[]>([])

function statusTagType(status: RecentOrder['status']): 'success' | 'warning' | 'info' | 'danger' {
  const map: Record<RecentOrder['status'], 'success' | 'warning' | 'info' | 'danger'> = {
    paid: 'success', shipped: 'warning', pending: 'info', refunded: 'danger',
  }
  return map[status]
}

function statusLabel(status: RecentOrder['status']): string {
  const map: Record<RecentOrder['status'], string> = {
    paid: '已付款', shipped: '已发货', pending: '待付款', refunded: '已退款',
  }
  return map[status]
}

onMounted(async () => {
  const [s, t, c, o] = await Promise.all([
    getDashboardStats(), getSalesTrend(), getCategoryStats(), getRecentOrders(),
  ])
  stats.value = s
  salesTrend.value = t
  categoryStats.value = c
  recentOrders.value = o
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 16px; }
.stats-row { display: flex; gap: 16px; }
.charts-row { display: flex; gap: 16px; }
.chart-col { flex: 1; min-width: 0; }
.orders-card { width: 100%; }
</style>
