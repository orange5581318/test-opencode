# Dashboard (Phase 3) 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Dashboard 占位页替换为包含统计卡片、ECharts 图表和最新订单列表的完整数据看板页面。

**Architecture:** Mock 层提供 4 个独立接口，api 层封装调用，Dashboard 页面组合三个子组件（StatsCard、SalesChart、CategoryChart）并在 onMounted 并发拉取所有数据；ECharts 实例在各图表组件内部通过 template ref 管理生命周期，避免内存泄漏。

**Tech Stack:** Vue 3 + TypeScript + Element Plus + ECharts 6 + Axios + vite-plugin-mock

---

## 文件清单

### 新建文件
- `mock/dashboard.ts`
- `src/api/dashboard.ts`
- `src/views/dashboard/components/StatsCard.vue`
- `src/views/dashboard/components/SalesChart.vue`
- `src/views/dashboard/components/CategoryChart.vue`

### 修改文件
- `src/views/dashboard/index.vue`

---

## Task 1: Mock 数据

**Files:** Create `mock/dashboard.ts`

- [ ] Step 1: 创建 `mock/dashboard.ts`

```typescript
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
```

- [ ] Commit: `git add mock/dashboard.ts && git commit -m "feat: add dashboard mock endpoints"`

---

## Task 2: API 层

**Files:** Create `src/api/dashboard.ts`

- [ ] Step 1: 创建 `src/api/dashboard.ts`

```typescript
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
```

- [ ] Commit: `git add src/api/dashboard.ts && git commit -m "feat: add dashboard api functions and types"`

---

## Task 3: StatsCard 组件

**Files:** Create `src/views/dashboard/components/StatsCard.vue`

- [ ] Step 1: 创建文件

```vue
<template>
  <el-card class="stats-card" shadow="hover">
    <div class="card-body">
      <div class="card-icon" :style="{ background: iconBg }">
        <el-icon :size="28" color="#fff">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="card-info">
        <div class="card-label">{{ label }}</div>
        <div class="card-value">{{ formattedValue }}</div>
        <div class="card-trend" :class="trend >= 0 ? 'up' : 'down'">
          <el-icon><component :is="trend >= 0 ? 'ArrowUp' : 'ArrowDown'" /></el-icon>
          {{ Math.abs(trend) }}% 较上期
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  icon: string
  iconBg: string
  label: string
  value: number
  trend: number
}>()

const formattedValue = computed(() =>
  props.value >= 10000
    ? (props.value / 10000).toFixed(1) + '万'
    : props.value.toLocaleString()
)
</script>

<style scoped>
.stats-card { flex: 1; min-width: 0; }
.card-body { display: flex; align-items: center; gap: 16px; }
.card-icon {
  width: 56px; height: 56px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.card-info { flex: 1; min-width: 0; }
.card-label { font-size: 13px; color: #909399; margin-bottom: 4px; }
.card-value { font-size: 24px; font-weight: 700; color: #303133; line-height: 1.2; }
.card-trend { font-size: 12px; margin-top: 4px; display: flex; align-items: center; gap: 2px; }
.card-trend.up { color: #f56c6c; }
.card-trend.down { color: #67c23a; }
</style>
```

- [ ] Commit: `git add src/views/dashboard/components/StatsCard.vue && git commit -m "feat: add StatsCard component"`

---

## Task 4: SalesChart 折线图

**Files:** Create `src/views/dashboard/components/SalesChart.vue`

- [ ] Step 1: 创建文件

```vue
<template>
  <el-card shadow="hover">
    <template #header><span>近7天销售趋势</span></template>
    <div ref="chartEl" class="chart-container" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { SalesTrend } from '@/api/dashboard'

const props = defineProps<{ data: SalesTrend | null }>()
const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function renderChart() {
  if (!chart || !props.data) return
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/>销售额：¥${p.value.toLocaleString()}`
      },
    },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: props.data.dates,
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisTick: { show: false },
      axisLabel: { color: '#909399' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#909399',
        formatter: (v: number) => (v >= 10000 ? v / 10000 + '万' : String(v)),
      },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'line',
      data: props.data.values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#409eff', width: 2 },
      itemStyle: { color: '#409eff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64,158,255,0.3)' },
          { offset: 1, color: 'rgba(64,158,255,0.02)' },
        ]),
      },
    }],
  })
}

watch(() => props.data, renderChart)

onMounted(() => {
  if (chartEl.value) {
    chart = echarts.init(chartEl.value)
    renderChart()
  }
})

onUnmounted(() => {
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart-container { height: 280px; width: 100%; }
</style>
```

- [ ] Commit: `git add src/views/dashboard/components/SalesChart.vue && git commit -m "feat: add SalesChart ECharts line chart component"`

---

## Task 5: CategoryChart 柱状图

**Files:** Create `src/views/dashboard/components/CategoryChart.vue`

- [ ] Step 1: 创建文件

```vue
<template>
  <el-card shadow="hover">
    <template #header><span>各分类商品销量</span></template>
    <div ref="chartEl" class="chart-container" />
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'
import type { CategoryStat } from '@/api/dashboard'

const props = defineProps<{ data: CategoryStat[] }>()
const chartEl = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function renderChart() {
  if (!chart || !props.data.length) return
  chart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: props.data.map((d) => d.name),
      axisLine: { lineStyle: { color: '#e4e7ed' } },
      axisTick: { show: false },
      axisLabel: { color: '#909399' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#909399' },
      splitLine: { lineStyle: { color: '#f0f0f0' } },
    },
    series: [{
      type: 'bar',
      data: props.data.map((d) => d.value),
      barMaxWidth: 40,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#67c23a' },
          { offset: 1, color: '#b3e19d' },
        ]),
        borderRadius: [4, 4, 0, 0],
      },
    }],
  })
}

watch(() => props.data, renderChart, { deep: true })

onMounted(() => {
  if (chartEl.value) {
    chart = echarts.init(chartEl.value)
    renderChart()
  }
})

onUnmounted(() => {
  chart?.dispose()
  chart = null
})
</script>

<style scoped>
.chart-container { height: 280px; width: 100%; }
</style>
```

- [ ] Commit: `git add src/views/dashboard/components/CategoryChart.vue && git commit -m "feat: add CategoryChart ECharts bar chart component"`

---

## Task 6: Dashboard 主页面

**Files:** Modify `src/views/dashboard/index.vue`

- [ ] Step 1: 读取现有文件，然后完整替换内容

```vue
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
```

- [ ] Commit: `git add src/views/dashboard/index.vue && git commit -m "feat: implement full dashboard page"`

---

## Task 7: 验证

- [ ] Step 1: `npm run type-check` — Expected: 无错误
- [ ] Step 2: 启动 `npm run dev`，登录后验证：
  1. 4 张统计卡片显示数值和趋势箭头
  2. 折线图 + 柱状图正常渲染
  3. 最新订单表格显示 5 条，状态标签颜色正确
