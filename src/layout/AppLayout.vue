<template>
  <el-container class="app-layout">
    <AppSidebar />
    <el-container direction="vertical">
      <AppHeader />
      <AppMain />
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import AppSidebar from './AppSidebar.vue'
import AppHeader from './AppHeader.vue'
import AppMain from './AppMain.vue'
</script>

<style scoped>
.app-layout {
  height: 100vh;
  overflow: hidden;
  background: var(--ml-bg-deep);
}
</style>
