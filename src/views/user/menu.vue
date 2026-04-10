<template>
  <div class="menu-list">
    <el-card shadow="never" class="table-card">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增菜单</el-button>
      </div>

      <el-table v-loading="loading" :data="menuList" stripe style="width: 100%">
        <el-table-column prop="name" label="菜单名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="path" label="路径" min-width="140" show-overflow-tooltip />
        <el-table-column label="图标" width="140">
          <template #default="{ row }">
            <div v-if="row.icon" style="display: flex; align-items: center; gap: 6px">
              <el-icon><component :is="row.icon" /></el-icon>
              <span>{{ row.icon }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="component" label="组件" min-width="140" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column label="隐藏" width="80">
          <template #default="{ row }">
            <el-tag :type="row.hidden ? 'danger' : 'success'" size="small">
              {{ row.hidden ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑菜单' : '新增菜单'"
      width="560px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" style="padding-right: 20px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入菜单名称" maxlength="30" show-word-limit />
        </el-form-item>
        <el-form-item label="路径" prop="path">
          <el-input v-model="form.path" placeholder="请输入路由路径" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="Odometer" />
        </el-form-item>
        <el-form-item label="组件">
          <el-input v-model="form.component" placeholder="dashboard/index" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :value="1">启用</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="隐藏">
          <el-switch v-model="form.hidden" />
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
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getSystemMenuList, addSystemMenu, updateSystemMenu, deleteSystemMenu,
} from '@/api/system'
import type { SystemMenu, SystemMenuForm } from '@/api/system'

const loading = ref(false)
const menuList = ref<SystemMenu[]>([])

/** 加载菜单列表数据 */
async function fetchList() {
  loading.value = true
  try {
    menuList.value = await getSystemMenuList()
  } finally {
    loading.value = false
  }
}

/** 删除菜单（含二次确认） */
async function handleDelete(row: SystemMenu) {
  await ElMessageBox.confirm(`确定删除菜单「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  })
  await deleteSystemMenu(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const defaultForm = (): SystemMenuForm => ({
  name: '', path: '', icon: '', component: '', sort: 0, status: 1, hidden: false,
})
const form = reactive<SystemMenuForm>(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  path: [{ required: true, message: '请输入路由路径', trigger: 'blur' }],
}

/** 打开新增/编辑菜单弹窗 */
function openDialog(row?: SystemMenu) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, {
      name: row.name, path: row.path, icon: row.icon, component: row.component,
      sort: row.sort, status: row.status, hidden: row.hidden,
    })
  } else {
    editingId.value = null
    Object.assign(form, defaultForm())
  }
  dialogVisible.value = true
}

/** 重置表单数据 */
function resetForm() {
  formRef.value?.clearValidate()
  Object.assign(form, defaultForm())
  editingId.value = null
}

/** 提交菜单表单（新增或编辑） */
async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateSystemMenu({ ...form, id: editingId.value })
      ElMessage.success('更新成功')
    } else {
      await addSystemMenu(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.menu-list { display: flex; flex-direction: column; gap: 16px; }
.toolbar { margin-bottom: 12px; }
</style>
