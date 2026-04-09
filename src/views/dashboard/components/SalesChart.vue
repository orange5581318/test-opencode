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
      backgroundColor: '#1e2035',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e8e9ed' },
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/>销售额：¥${p.value.toLocaleString()}`
      },
    },
    grid: { left: 40, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: props.data.dates,
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#9a9cb0' },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        color: '#9a9cb0',
        formatter: (v: number) => (v >= 10000 ? v / 10000 + '万' : String(v)),
      },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
    },
    series: [{
      type: 'line',
      data: props.data.values,
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: { color: '#f0a030', width: 2 },
      itemStyle: { color: '#f0a030' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(240,160,48,0.25)' },
          { offset: 1, color: 'rgba(240,160,48,0.02)' },
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
