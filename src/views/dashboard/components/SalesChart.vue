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
