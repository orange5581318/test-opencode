<template>
  <div class="user-list">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索用户名/昵称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 130px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增用户</el-button>
      </div>

      <el-table v-loading="loading" :data="userList" stripe style="width: 100%">
        <el-table-column label="头像" width="80" align="center">
          <template #default="{ row }">
            <el-image
              :src="row.avatar"
              style="width: 40px; height: 40px; border-radius: 50%"
              fit="cover"
            />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="120" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="roleName" label="角色" min-width="140" show-overflow-tooltip />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button
              :type="row.status === 1 ? 'warning' : 'success'"
              link
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 1 ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
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

    <el-dialog
      v-model="dialogVisible"
      :title="editingUser ? '编辑用户' : '新增用户'"
      width="520px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" style="padding-right: 20px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="角色" prop="roleIds">
          <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getSystemUserList,
  addSystemUser,
  updateSystemUser,
  deleteSystemUser,
  toggleSystemUserStatus,
  getAllRoles,
} from '@/api/system'
import type { SystemUser, SystemUserForm, Role } from '@/api/system'

const roleOptions = ref<Role[]>([])

const searchForm = reactive({
  keyword: '',
  status: '' as number | '',
})

const loading = ref(false)
const userList = ref<SystemUser[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== '') params.status = searchForm.status
    const res = await getSystemUserList(params)
    userList.value = res.list
    pagination.total = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() { pagination.page = 1; fetchList() }
function handleReset() {
  searchForm.keyword = ''; searchForm.status = ''
  pagination.page = 1; fetchList()
}

// Dialog
const dialogVisible = ref(false)
const submitting = ref(false)
const editingUser = ref<SystemUser | null>(null)
const formRef = ref<FormInstance>()
const form = reactive<SystemUserForm>({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  status: 1,
  roleIds: [],
})

const rules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
}

function openDialog(row?: SystemUser) {
  editingUser.value = row || null
  if (row) {
    form.username = row.username
    form.nickname = row.nickname
    form.email = row.email
    form.phone = row.phone
    form.status = row.status
    form.roleIds = [...row.roleIds]
  } else {
    form.username = ''
    form.nickname = ''
    form.email = ''
    form.phone = ''
    form.status = 1
    form.roleIds = []
  }
  dialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  editingUser.value = null
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (editingUser.value) {
      await updateSystemUser({ ...form, id: editingUser.value.id })
      ElMessage.success('更新成功')
    } else {
      await addSystemUser({ ...form })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleToggleStatus(row: SystemUser) {
  const nextStatus = row.status === 1 ? 0 : 1
  const label = nextStatus === 1 ? '启用' : '禁用'
  await ElMessageBox.confirm(`确定要${label}该用户吗？`, '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  })
  await toggleSystemUserStatus(row.id, nextStatus)
  ElMessage.success(`${label}成功`)
  fetchList()
}

async function handleDelete(row: SystemUser) {
  await ElMessageBox.confirm('确定要删除该用户吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  })
  await deleteSystemUser(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(async () => {
  fetchList()
  roleOptions.value = await getAllRoles()
})
</script>

<style scoped>
.user-list { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.search-form { display: flex; flex-wrap: wrap; }
.toolbar { margin-bottom: 12px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
