<template>
  <el-main class="app-main">
    <router-view v-slot="{ Component }">
      <keep-alive>
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </el-main>
</template>

<style scoped>
.app-main {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--ml-bg-main);
}
</style>
