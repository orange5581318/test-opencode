<template>
  <div class="login-page">
    <div class="login-bg-pattern"></div>
    <div class="login-card">
      <div class="login-header">
        <div class="login-logo">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="9" height="9" rx="2" fill="#f0a030" opacity="0.9"/>
            <rect x="13" y="2" width="9" height="9" rx="2" fill="#f0a030" opacity="0.5"/>
            <rect x="2" y="13" width="9" height="9" rx="2" fill="#f0a030" opacity="0.5"/>
            <rect x="13" y="13" width="9" height="9" rx="2" fill="#f0a030" opacity="0.3"/>
          </svg>
        </div>
        <h2 class="login-title">Mall Admin</h2>
        <p class="login-subtitle">商城后台管理系统</p>
      </div>
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        @keyup.enter="handleLogin"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="form.userName" placeholder="admin" :prefix-icon="User" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="123456" show-password :prefix-icon="Lock" />
        </el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          class="login-btn"
          @click="handleLogin"
        >
          登录
        </el-button>
      </el-form>
      <div class="login-footer">
        <span>默认账号: admin / 123456</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({ userName: '', password: '' })

const rules: FormRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await userStore.loginAction(form)
    router.push('/')
  } catch {
    // ElMessage shown by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ml-bg-deep);
  position: relative;
  overflow: hidden;
}
.login-bg-pattern {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(240, 160, 48, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(240, 160, 48, 0.05) 0%, transparent 40%);
  pointer-events: none;
}
.login-card {
  width: 400px;
  background: var(--ml-bg-card);
  border: 1px solid var(--ml-border-light);
  border-radius: var(--ml-radius-lg);
  padding: 40px 36px 32px;
  box-shadow: var(--ml-shadow-lg);
  position: relative;
  z-index: 1;
}
.login-header {
  text-align: center;
  margin-bottom: 32px;
}
.login-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: var(--ml-accent-soft);
  border-radius: 14px;
  margin-bottom: 16px;
}
.login-title {
  font-family: var(--ml-font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--ml-text-bright);
  margin: 0 0 4px;
  letter-spacing: -0.5px;
}
.login-subtitle {
  font-size: 14px;
  color: var(--ml-text-muted);
  margin: 0;
}
.login-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
  margin-top: 8px;
}
.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: var(--ml-text-muted);
}
</style>
