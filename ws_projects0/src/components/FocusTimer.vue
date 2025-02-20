<template>
  <div class="focus-timer-container">
    <!-- 倒计时圆圈 -->
    <div class="timer-circle">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" stroke="#ddd" stroke-width="10" fill="none"/>
        <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#007bff"
            stroke-width="10"
            fill="none"
            stroke-dasharray="565.48"
            :stroke-dashoffset="(remainingTime / totalDuration) * 565.48"
            stroke-linecap="round"
        />
      </svg>
      <span class="timer-text">{{ formattedTime }}</span>
    </div>

    <!-- 控制按钮 -->
    <div class="timer-controls">
      <button v-if="!isPaused" class="pause-btn" @click="pauseTimer">⏸️ Pause</button>
      <button v-if="isPaused" class="resume-btn" @click="resumeTimer">▶️ Continue</button>
<!--      <button class="stop-btn" @click="stopTimer">🛑 Give Up</button>-->
      <button class="stop-btn" @click="stopTimer(false)">🛑 Give Up</button>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, onUnmounted, inject} from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();

// 从 URL 获取任务设定的 duration，如果没有，默认 30 分钟
const totalDuration = ref(Number(route.query.duration) * 60|| 30 * 60);
const remainingTime = ref(totalDuration.value);
const isPaused = ref(false);
let timer = null;

const userId = ref(localStorage.getItem("userId"));
// const userCoins = inject("userCoins");
// const selectedTask = inject("selectedTask");

import { userTaskStore } from "../store/store.js";
import {storeToRefs} from "pinia";

const taskStore = userTaskStore();
const { userCoins } = storeToRefs(taskStore);
const { selectedTask } = storeToRefs(taskStore);
const { completedTasks } = storeToRefs(taskStore);


// 计算倒计时格式（MM:SS）
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});

// 开始倒计时
// const startTimer = () => {
//   if (timer) return;
//   timer = setInterval(() => {
//     if (remainingTime.value > 0) {
//       remainingTime.value--;
//     } else {
//       stopTimer();
//       alert("Focus time is over! 🎉");
//     }
//   }, 1000);
// };

// **修改倒计时逻辑**
const startTimer = () => {
  if (timer) return;
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      stopTimer(true); // 计时结束后，正常完成任务
    }
  }, 1000);
};

// 暂停倒计时
const pauseTimer = () => {
  isPaused.value = true;
  clearInterval(timer);
  timer = null;
};

// 继续倒计时
const resumeTimer = () => {
  isPaused.value = false;
  startTimer();
};

// 停止倒计时（返回主页）
// const stopTimer = () => {
//   clearInterval(timer);
//   timer = null;
//   remainingTime.value = totalDuration.value * 60;
//   router.push("/home"); // 返回主页
// };

// **停止倒计时**
const stopTimer = (isCompleted = false) => {
  clearInterval(timer);
  timer = null;

  // 弹出不同的提示信息
  const message = isCompleted
      ? "Focus time is over! You obtain reward coins. 🎉"
      : "You gave up! No coins awarded.";

  alert(message); // 先弹出提示

  if (isCompleted && selectedTask.value) {
    updateUserCoins(selectedTask.value.rewardCoins);

    completedTasks.value.push(selectedTask.value);
    selectedTask.value = null;
  }

  // 让 alert 完成后再执行跳转
  setTimeout(() => {
    remainingTime.value = totalDuration.value * 60; // 重置倒计时
    router.push("/home"); // 返回主页
  }, 0);
};


// **更新用户积分**
const updateUserCoins = async (rewardCoins) => {
  try {
    await axios.post("http://localhost:8080/user/updateCoins", {
      userId: userId.value,
      rewardCoins: Number(rewardCoins)
    });

    // **前端手动更新 userCoins**
    userCoins.value += rewardCoins;
  } catch (err) {
    console.error("Failed to update coins:", err);
  }
};

// 组件挂载时启动倒计时
onMounted(() => {
  startTimer();
});

// 组件卸载时清除计时器
onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.focus-timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.timer-circle {
  position: relative;
  width: 200px;
  height: 200px;
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2rem;
  font-weight: bold;
  color: #2c3e50;
}

.timer-controls {
  margin-top: 20px;
  display: flex;
  gap: 15px;
}

button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
}

.pause-btn {
  background-color: #ffcc00;
  color: black;
}

.resume-btn {
  background-color: #28a745;
  color: white;
}

.stop-btn {
  background-color: #dc3545;
  color: white;
}
</style>


