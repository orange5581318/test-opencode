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
