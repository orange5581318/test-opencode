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
