<template>
  <div class="calendar-container">
    <vue-cal
        :events="events"
        :time-from="8 * 60"
        :time-to="20 * 60"
        style="height: 600px"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import "vue-cal/dist/vuecal.css"; // 引入样式
import VueCal from "vue-cal"; // 引入 Vue Cal 组件

// 示例事件
const events = ref([
  { start: "2024-02-22 10:00", end: "2024-02-22 12:00", title: "Study Time" },
  { start: "2024-02-23 14:00", end: "2024-02-23 16:00", title: "Workout" }
]);
</script>

<style scoped>
.calendar-container {
  max-width: 800px;
  margin: auto;
}
</style>




