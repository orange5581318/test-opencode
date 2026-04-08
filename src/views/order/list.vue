<template>
  <div class="order-list">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单号">
          <el-input
            v-model="searchForm.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 130px">
            <el-option label="待付款" :value="0" />
            <el-option label="待发货" :value="1" />
            <el-option label="已发货" :value="2" />
            <el-option label="已完成" :value="3" />
            <el-option label="已退款" :value="4" />
            <el-option label="已取消" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="下单时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 260px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table v-loading="loading" :data="orderList" stripe style="width: 100%">
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column prop="username" label="用户" width="120" />
        <el-table-column prop="itemCount" label="商品数" width="80" align="center" />
        <el-table-column label="总金额" width="110" align="right">
          <template #default="{ row }">¥{{ row.totalAmount.toFixed(2) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType[row.status]" size="small">{{ statusLabel[row.status] }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="handleDetail(row)">详情</el-button>
            <el-button v-if="row.status === 1" type="warning" link size="small" @click="openShipDialog(row)">发货</el-button>
            <el-button v-if="row.status === 1 || row.status === 2" type="danger" link size="small" @click="openRefundDialog(row)">退款</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="fetchList"
          @current-change="fetchList"
        />
      </div>
    </el-card>

    <el-dialog v-model="shipDialogVisible" title="订单发货" width="480px" :close-on-click-modal="false">
      <el-form label-width="80px" style="padding-right: 20px">
        <el-form-item label="订单号">
          <el-input :model-value="shipForm.orderNo" readonly />
        </el-form-item>
        <el-form-item label="快递单号" required>
          <el-input v-model="shipForm.expressNo" placeholder="请输入快递单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipSubmitting" @click="handleShip">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="refundDialogVisible" title="订单退款" width="480px" :close-on-click-modal="false">
      <el-form label-width="80px" style="padding-right: 20px">
        <el-form-item label="订单号">
          <el-input :model-value="refundForm.orderNo" readonly />
        </el-form-item>
        <el-form-item label="退款原因" required>
          <el-input v-model="refundForm.reason" type="textarea" :rows="3" placeholder="请输入退款原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="refundSubmitting" @click="handleRefund">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderList, shipOrder, refundOrder } from '@/api/order'
import type { Order } from '@/api/order'

const router = useRouter()

const statusLabel: Record<number, string> = {
  0: '待付款', 1: '待发货', 2: '已发货', 3: '已完成', 4: '已退款', 5: '已取消',
}
const statusTagType: Record<number, string> = {
  0: 'warning', 1: '', 2: '', 3: 'success', 4: 'danger', 5: 'info',
}

const searchForm = reactive({
  orderNo: '',
  status: '' as number | '',
  dateRange: null as [string, string] | null,
})

const loading = ref(false)
const orderList = ref<Order[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.orderNo) params.orderNo = searchForm.orderNo
    if (searchForm.status !== '') params.status = searchForm.status
    if (searchForm.dateRange) {
      params.startDate = searchForm.dateRange[0]
      params.endDate = searchForm.dateRange[1]
    }
    const res = await getOrderList(params)
    orderList.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchList() }
function handleReset() {
  searchForm.orderNo = ''; searchForm.status = ''; searchForm.dateRange = null
  pagination.page = 1; fetchList()
}

function handleDetail(row: Order) {
  router.push({ path: '/order/detail', query: { id: row.id } })
}

// Ship dialog
const shipDialogVisible = ref(false)
const shipSubmitting = ref(false)
const shipForm = reactive({ id: 0, orderNo: '', expressNo: '' })

function openShipDialog(row: Order) {
  shipForm.id = row.id
  shipForm.orderNo = row.orderNo
  shipForm.expressNo = ''
  shipDialogVisible.value = true
}

async function handleShip() {
  if (!shipForm.expressNo.trim()) {
    ElMessage.warning('请输入快递单号')
    return
  }
  shipSubmitting.value = true
  try {
    await shipOrder(shipForm.id, shipForm.expressNo)
    ElMessage.success('发货成功')
    shipDialogVisible.value = false
    fetchList()
  } finally {
    shipSubmitting.value = false
  }
}

// Refund dialog
const refundDialogVisible = ref(false)
const refundSubmitting = ref(false)
const refundForm = reactive({ id: 0, orderNo: '', reason: '' })

function openRefundDialog(row: Order) {
  refundForm.id = row.id
  refundForm.orderNo = row.orderNo
  refundForm.reason = ''
  refundDialogVisible.value = true
}

async function handleRefund() {
  if (!refundForm.reason.trim()) {
    ElMessage.warning('请输入退款原因')
    return
  }
  await ElMessageBox.confirm('确定要退款该订单吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  })
  refundSubmitting.value = true
  try {
    await refundOrder(refundForm.id, refundForm.reason)
    ElMessage.success('退款成功')
    refundDialogVisible.value = false
    fetchList()
  } finally {
    refundSubmitting.value = false
  }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.order-list { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.search-form { display: flex; flex-wrap: wrap; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
