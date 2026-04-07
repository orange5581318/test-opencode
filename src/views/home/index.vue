<template>
  <div class="count-button">
    <button @click="increment">{{ count }}</button>
    <div class="list">
      <div v-for="(value, key, index) in personObject" :key="key">
        <span>{{ index+1 }}、{{ key }}: {{ value }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
const count = ref(0);
function increment() {
  count.value++;
}

const personObject = ref({
  name: "陈平安",
  age: 18,
  sex: "男",
  level: "学徒",
});
</script>

<style></style>
