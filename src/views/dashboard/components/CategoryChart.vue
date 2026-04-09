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
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#1e2035',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#e8e9ed' },
    },
    grid: { left: 50, right: 20, top: 20, bottom: 30 },
    xAxis: {
      type: 'category',
      data: props.data.map((d) => d.name),
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
      axisLabel: { color: '#9a9cb0' },
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#9a9cb0' },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
    },
    series: [{
      type: 'bar',
      data: props.data.map((d) => d.value),
      barMaxWidth: 40,
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#f0a030' },
          { offset: 1, color: 'rgba(240,160,48,0.4)' },
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
