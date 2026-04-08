<template>
  <div class="product-category">
    <el-card shadow="never">
      <div class="toolbar">
        <el-button type="primary" :icon="Plus" @click="openDialog()">新增分类</el-button>
      </div>

      <el-table v-loading="loading" :data="categoryList" stripe style="width: 100%">
        <el-table-column prop="name" label="分类名称" min-width="160" />
        <el-table-column prop="productCount" label="商品数量" width="120" />
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="editingId ? '编辑分类' : '新增分类'"
      width="420px"
      :close-on-click-modal="false"
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" style="padding-right: 20px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" maxlength="20" show-word-limit />
        </el-form-item>
        <el-form-item label="排序值" prop="sort">
          <el-input-number v-model="form.sort" :min="1" :precision="0" :step="1" style="width: 100%" />
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
import { getCategories, addCategory, updateCategory, deleteCategory } from '@/api/product'
import type { Category, CategoryForm } from '@/api/product'

const loading = ref(false)
const categoryList = ref<Category[]>([])

async function fetchList() {
  loading.value = true
  try { categoryList.value = await getCategories() }
  finally { loading.value = false }
}

async function handleDelete(row: Category) {
  await ElMessageBox.confirm(`确定删除分类「${row.name}」吗？`, '提示', {
    confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning',
  })
  await deleteCategory(row.id)
  ElMessage.success('删除成功')
  fetchList()
}

const dialogVisible = ref(false)
const submitting = ref(false)
const editingId = ref<number | null>(null)
const formRef = ref<FormInstance>()

const defaultForm = (): CategoryForm => ({ name: '', sort: '' })
const form = reactive<CategoryForm>(defaultForm())

const rules: FormRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }],
  sort: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
}

function openDialog(row?: Category) {
  if (row) {
    editingId.value = row.id
    Object.assign(form, { name: row.name, sort: row.sort })
  } else {
    editingId.value = null
    Object.assign(form, defaultForm())
  }
  dialogVisible.value = true
}

function resetForm() { formRef.value?.clearValidate(); Object.assign(form, defaultForm()); editingId.value = null }

async function handleSubmit() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    if (editingId.value) {
      await updateCategory({ ...form, id: editingId.value } as any)
      ElMessage.success('更新成功')
    } else {
      await addCategory(form as any)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

onMounted(fetchList)
</script>

<style scoped>
.product-category { display: flex; flex-direction: column; gap: 16px; }
.toolbar { margin-bottom: 12px; }
</style>
