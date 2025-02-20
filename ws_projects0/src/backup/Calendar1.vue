<template>
  <FullCalendar :options="calendarOptions" />
</template>

<script setup>
import { ref } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";

const calendarOptions = ref({
  plugins: [dayGridPlugin],
  initialView: "dayGridMonth",
  events: [{ title: "Task Due", start: "2024-02-28" }],
});
</script>

<style scoped>
.fc {
  max-width: 900px;
  margin: auto;
}
</style>

