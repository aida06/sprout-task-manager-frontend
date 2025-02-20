import { defineStore } from "pinia";
import { ref } from "vue";

export const userTaskStore = defineStore("taskStore", () => {
    const selectedTask = ref(null);
    const userCoins = ref(0);
    const completedTasks = ref([]);
    return { selectedTask, userCoins, completedTasks };
});
