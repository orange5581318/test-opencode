<template>
  <div v-loading="loading" class="order-detail">
    <div class="header-bar">
      <el-button :icon="ArrowLeft" @click="router.back()">返回</el-button>
      <h2>订单详情</h2>
    </div>

    <template v-if="order">
      <!-- 基本信息 -->
      <el-card shadow="never">
        <template #header>基本信息</template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单号">{{ order.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagTypes[order.status]">{{ statusLabels[order.status] }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="用户名">{{ order.username }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ order.phone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ order.address }}</el-descriptions-item>
          <el-descriptions-item label="总金额">
            <span style="color: #f56c6c; font-weight: bold">¥{{ order.totalAmount.toFixed(2) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ order.createTime }}</el-descriptions-item>
          <el-descriptions-item label="付款时间">{{ order.payTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发货时间">{{ order.shipTime || '-' }}</el-descriptions-item>
          <el-descriptions-item label="快递单号">{{ order.expressNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ order.remark || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="order.refundReason" label="退款原因">
            <span style="color: #f56c6c">{{ order.refundReason }}</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 商品列表 -->
      <el-card shadow="never">
        <template #header>商品列表</template>
        <el-table :data="order.items" border>
          <el-table-column label="商品图片" width="100" align="center">
            <template #default="{ row }">
              <el-image :src="row.image" style="width: 60px; height: 60px" fit="cover" />
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="name" />
          <el-table-column label="单价" width="120" align="right">
            <template #default="{ row }">¥{{ row.price.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="100" align="center" />
          <el-table-column label="小计" width="120" align="right">
            <template #default="{ row }">
              <span style="color: #f56c6c">¥{{ row.subtotal.toFixed(2) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 订单时间线 -->
      <el-card shadow="never">
        <template #header>订单进度</template>
        <el-timeline>
          <el-timeline-item timestamp="" placement="top">
            <p>创建订单</p>
            <p style="color: #909399; font-size: 13px">{{ order.createTime }}</p>
          </el-timeline-item>
          <el-timeline-item v-if="order.payTime" timestamp="" placement="top">
            <p>付款成功</p>
            <p style="color: #909399; font-size: 13px">{{ order.payTime }}</p>
          </el-timeline-item>
          <el-timeline-item v-if="order.shipTime" timestamp="" placement="top">
            <p>已发货</p>
            <p style="color: #909399; font-size: 13px">{{ order.shipTime }}</p>
            <p v-if="order.expressNo" style="color: #909399; font-size: 13px">
              快递单号：{{ order.expressNo }}
            </p>
          </el-timeline-item>
          <el-timeline-item v-if="order.status === 3" type="success" timestamp="" placement="top">
            <p>已完成</p>
          </el-timeline-item>
          <el-timeline-item v-if="order.status === 4" type="danger" timestamp="" placement="top">
            <p>已退款</p>
            <p v-if="order.refundReason" style="color: #f56c6c; font-size: 13px">
              退款原因：{{ order.refundReason }}
            </p>
          </el-timeline-item>
          <el-timeline-item v-if="order.status === 5" type="info" timestamp="" placement="top">
            <p>已取消</p>
          </el-timeline-item>
        </el-timeline>
      </el-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import { getOrderDetail } from '@/api/order'
import type { Order } from '@/api/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const order = ref<Order>()

const statusLabels = ['待付款', '待发货', '已发货', '已完成', '已退款', '已取消']
const statusTagTypes: Record<number, '' | 'success' | 'warning' | 'danger' | 'info'> = {
  0: 'warning',
  1: '',
  2: '',
  3: 'success',
  4: 'danger',
  5: 'info'
}

const fetchDetail = async () => {
  const id = Number(route.query.id)
  if (!id) return
  loading.value = true
  try {
    order.value = await getOrderDetail(id)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})
</script>

<style scoped>
.order-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.header-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-bar h2 {
  margin: 0;
  font-size: 18px;
}
</style>
