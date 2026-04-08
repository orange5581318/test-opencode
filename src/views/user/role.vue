<template>
  <div class="role-list">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索角色名称/编码"
            clearable
            style="width: 220px"
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
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增角色</el-button>
      </div>

      <el-table v-loading="loading" :data="roleList" stripe style="width: 100%">
        <el-table-column prop="name" label="角色名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="code" label="角色编码" min-width="120" show-overflow-tooltip />
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
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

    <el-dialog v-model="dialogVisible" :title="editingRole ? '编辑角色' : '新增角色'" width="560px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="roleForm" :rules="formRules" label-width="90px" style="padding-right: 20px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限" prop="permissionIds">
          <el-tree
            ref="treeRef"
            :data="menuList"
            show-checkbox
            node-key="id"
            :props="{ label: 'name' }"
            default-expand-all
          />
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
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import {
  getRoleList,
  addRole,
  updateRole,
  deleteRole,
  getSystemMenuList,
} from '@/api/system'
import type { Role, RoleForm, SystemMenu } from '@/api/system'

const searchForm = reactive({
  keyword: '',
  status: '' as number | '',
})

const loading = ref(false)
const roleList = ref<Role[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

async function fetchList() {
  loading.value = true
  try {
    const params: any = { page: pagination.page, pageSize: pagination.pageSize }
    if (searchForm.keyword) params.keyword = searchForm.keyword
    if (searchForm.status !== '') params.status = searchForm.status
    const res = await getRoleList(params)
    roleList.value = res.list
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

// Menu tree data
const menuList = ref<SystemMenu[]>([])

async function fetchMenuList() {
  menuList.value = await getSystemMenuList()
}

// Dialog
const dialogVisible = ref(false)
const submitting = ref(false)
const editingRole = ref<Role | null>(null)
const formRef = ref<FormInstance>()
const treeRef = ref<InstanceType<any>>()

const roleForm = reactive<RoleForm>({
  name: '',
  code: '',
  description: '',
  status: 1,
  permissionIds: [],
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }],
}

function openDialog(row?: Role) {
  editingRole.value = row || null
  roleForm.name = row?.name || ''
  roleForm.code = row?.code || ''
  roleForm.description = row?.description || ''
  roleForm.status = row?.status ?? 1
  roleForm.permissionIds = row?.permissionIds || []
  dialogVisible.value = true
  nextTick(() => {
    formRef.value?.clearValidate()
    treeRef.value?.setCheckedKeys(row?.permissionIds || [])
  })
}

async function handleSubmit() {
  await formRef.value?.validate()
  roleForm.permissionIds = treeRef.value?.getCheckedKeys(false) as number[]
  submitting.value = true
  try {
    if (editingRole.value) {
      await updateRole({ ...roleForm, id: editingRole.value.id })
      ElMessage.success('更新成功')
    } else {
      await addRole({ ...roleForm })
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(row: Role) {
  await ElMessageBox.confirm('确定要删除该角色吗？', '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  })
  await deleteRole(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

onMounted(() => {
  fetchList()
  fetchMenuList()
})
</script>

<style scoped>
.role-list { display: flex; flex-direction: column; gap: 16px; }
.search-card :deep(.el-card__body) { padding-bottom: 0; }
.search-form { display: flex; flex-wrap: wrap; }
.toolbar { margin-bottom: 16px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
