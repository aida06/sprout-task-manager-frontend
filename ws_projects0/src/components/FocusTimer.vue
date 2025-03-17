<template>
  <div class="focus-timer-container" :style="{ backgroundImage: `url(${selectedBackground})` }">
    <!-- 倒计时圆圈 -->
    <div class="timer-circle">
      <svg width="300" height="300" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" stroke="#F5F5F5" stroke-width="12" fill="none"/>  # 灰色背景圆
        <circle
            cx="100"
            cy="100"
            r="90"
            stroke="#B2DFDB"
            stroke-width="12"
            fill="none"
            stroke-dasharray="565.48"
            :stroke-dashoffset="(remainingTime / totalDuration) * 565.48"
            stroke-linecap="round"
        />  # 动态倒计时圆
      </svg>
      <span class="timer-text">{{ formattedTime }}</span>
    </div>

    <!-- 控制按钮 -->
    <div class="timer-controls">
      <button class="light-button" @click="showBackgroundPanel = true">
        <el-icon><Picture /></el-icon> Background
      </button>

      <button class="light-button" @click="showSoundPanel = true">
        <el-icon><Headset /></el-icon> Sound
      </button>


      <button v-if="!isPaused" class="light-button" @click="pauseTimer">
        <el-icon><VideoPause /></el-icon>  Pause
      </button>

      <button v-if="isPaused" class="light-button" @click="resumeTimer">
        <el-icon><VideoPlay /></el-icon> Continue
      </button>

      <button class="light-button" @click="stopTimer(false)">
        <el-icon><Remove /></el-icon> Give Up
      </button>
    </div>

    <!-- 🌟 Background 面板 -->
    <el-dialog v-model="showBackgroundPanel" title="Select Timer Background">
      <div>
        <!-- 🌈 圆形 Tab 切换不同颜色的壁纸 -->
        <div class="color-tabs">
          <button
              v-for="(color, index) in Object.keys(backgroundCategories)"
              :key="index"
              :class="{ active: activeTab === color }"
              class="color-tab"
              @click="activeTab = color">
          </button>  <!-- 没有文字，只有按钮 -->
        </div>

        <!-- 当前选中的背景图片 -->
        <div class="background-options">
          <div v-for="(bg, index) in backgroundCategories[activeTab]" :key="index" class="bg-item">
            <img
                :src="bg"
                class="bg-thumbnail"
                @click="setBackground(bg)"
            />
            <p class="bg-name">{{ getBackgroundName(bg) }}</p> <!-- 显示文件名 -->
          </div>
        </div>
      </div>
    </el-dialog>


    <<el-dialog v-model="showSoundPanel" title="Select Background Sound">
    <div class="sound-options">
      <div
          v-for="(sound, index) in soundList"
          :key="index"
          class="sound-item"
          :class="{ active: selectedSound === sound.value }"
          @click="setSound(sound.value)"
      >
        <!-- 如果sound.img为空，则不渲染图片 -->
        <img v-if="sound.img" :src="sound.img" class="sound-thumbnail" />
        <!-- 如果没有图片，显示默认空白圆圈 -->
        <div v-else class="sound-thumbnail none-thumbnail"></div>
        <div class="sound-name">{{ sound.label }}</div>
      </div>
    </div>

    <!-- audio元素 -->
    <audio ref="audioPlayer" loop></audio>
  </el-dialog>

  </div>
</template>


<script setup>
import {ref, computed, onMounted, onUnmounted, inject} from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { PictureFilled, Picture, Headset, VideoPause, VideoPlay, Close, Remove } from '@element-plus/icons-vue'

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


const showBackgroundPanel = ref(false);  // 控制背景面板显示

const activeTab = ref("Green");  // 默认显示 Green 分类的壁纸

const selectedBackground = ref("src/wallpaper/Green/DayStudy.png");  // 默认背景

const backgroundCategories = ref({
  "Green": [
    "src/wallpaper/Green/DayStudy.png",
    "src/wallpaper/Green/ForestStation.png",
    "src/wallpaper/Green/RainyStreet.png",
    "src/wallpaper/Green/ButterflyForest.png",
    "src/wallpaper/Green/GrassLand.png"
  ],
  "Blue": [
    "src/wallpaper/Blue/NightStudy.png",
    "src/wallpaper/Blue/EveningStreet.png",
    "src/wallpaper/Blue/Sea.png"
  ],
  "Purple": [
    "src/wallpaper/Purple/WinterCity.png"
  ],
  "Yellow": [
    "src/wallpaper/Yellow/AutumnCity.jpg",
    "src/wallpaper/Yellow/Room.png",
    "src/wallpaper/Yellow/FlowerWindow.png",
    "src/wallpaper/Yellow/LondonKitty.png",
    "src/wallpaper/Yellow/SunsetSea.png",

  ]
});


const getBackgroundName = (bg) => {
  const name = bg.split("/").pop().replace(/\.(png|jpg|jpeg)$/i, "");
  return name
      .replace(/_/g, ' ')                    // 先处理下划线（如 Day_Study → Day Study）
      .replace(/([a-z])([A-Z])/g, '$1 $2');  // 再处理驼峰（如 DayStudy → Day Study）
};


// 切换背景
const setBackground = (bg) => {
  console.log("Selected background path:", bg); // 查看实际路径
  selectedBackground.value = bg;  // 直接修改 Vue 绑定的 `style`
};


// 控制音乐面板显示
const showSoundPanel = ref(false);

// 默认无声音
const selectedSound = ref("none");

// 音效列表（确保路径正确）
const soundList = ref([
  { value: "none", label: "None", img: "", audio: "" },
  { value: "Forest", label: "Forest", img: "/src/sound/cover/Forest3.jpg", audio: "/src/sound/Forest1.mp3" },
  { value: "Brook", label: "Brook", img: "/src/sound/cover/Brook.jpg", audio: "/src/sound/Brook.mp3" },
  { value: "Wave", label: "Wave", img: "/src/sound/cover/Wave1.jpeg", audio: "/src/sound/Wave.mp3" },
  { value: "Rain", label: "Rain", img: "/src/sound/cover/Rain5.jpg", audio: "/src/sound/Rain.mp3" },
  { value: "Fireplace", label: "Fireplace", img: "/src/sound/cover/Fire9.jpg", audio: "/src/sound/Fire.mp3" },
  { value: "Write", label: "Write", img: "/src/sound/cover/Write.jpg", audio: "/src/sound/Write.mp3" },
  { value: "City", label: "City", img: "/src/sound/cover/City4.jpg", audio: "/src/sound/City.mp3" },
  { value: "Piano", label: "Piano", img: "/src/sound/cover/Piano.jpg", audio: "/src/sound/Piano.mp3" },

]);

const audioPlayer = ref(null);

// 设置音效
// const setSound = (sound) => {
//   selectedSound.value = sound;
//
//   if (sound === 'none') {
//     audioPlayer.value.pause();
//     audioPlayer.value.src = '';
//   } else {
//     const audioSrc = soundList.value.find(s => s.value === sound)?.audio;
//     if (audioSrc) {
//       audioPlayer.value.src = audioSrc;
//       audioPlayer.value.play();
//     }
//   }
// };

// 设置音效
const setSound = (sound) => {
  selectedSound.value = sound;

  if (sound === 'none') {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
  } else {
    const selectedAudio = soundList.value.find(s => s.value === sound).audio;
    audioPlayer.value.src = selectedAudio;

    // 根据音效类型单独调整音量
    if (sound === 'Rain' || sound === 'Forest') {
      audioPlayer.value.volume = 0.2; // rain和forest降低到30%
    } else {
      audioPlayer.value.volume = 1; // 其他音效默认100%
    }

    audioPlayer.value.play();
  }
};


</script>


<style scoped>
.sound-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 22px;      /* 垂直方向间距 */
  column-gap: 8px;   /* 水平方向间距 */
  justify-items: center;
  align-items: center;
  padding: 15px;
  margin-top: 10px;
}

.sound-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  position: relative; /* 必须设置这个 */
  transition: transform 0.4s ease-in-out;
}

.sound-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  position: relative; /* 必须有这个 */
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.none-thumbnail {
  background-color: rgba(255,255,255,0.5);
}

/* 添加圆环边框效果（环绕 sound-thumbnail） */
.sound-item.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100px; /* 和图片宽高完全一致 */
  height: 100px;
  border: 3px solid rgba(255,255,255,0.9);
  border-radius: 50%;
  box-sizing: border-box; /* 必须添加，边框将向内缩 */
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  pointer-events: none; /* 防止干扰点击 */
}


/* 悬停放大效果 */
.sound-item:hover {
  transform: scale(1.1);
}

.sound-name {
  font-size: 15px;
  color: #44546A;
  margin-top: 10px;
  font-weight: bold;
  text-align: center;
}


.focus-timer-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 91.5vh;
  font-family: Arial, sans-serif;
  margin-top: 0px; /* 让整个内容向下移动 */


  /* 背景相关属性 */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  z-index: 1;

  /* 添加半透明遮罩 */
  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    z-index: -1;
  }
}


.timer-circle {
  position: absolute;
  top: 43%;
  left: 50%;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5)); /* 圆圈阴影 */
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5); /* 文本阴影 */
}

.timer-controls {
  margin-top: 380px;
  display: flex;
  gap: 40px;

}


/* 🌞 Light mode 按钮样式 */
.light-button {
  display: flex;
  flex-direction: column;  /* 让图标和文字垂直排列 */
  align-items: center;  /* 居中对齐 */
  justify-content: center;
  gap: 5px;  /* 让图标和文字之间有间距 */
  font-size: 19px;  /* 只影响文字，不影响图标 */
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.6); /* 按钮文字阴影 */
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5)); /* 图标阴影 */
}


.light-button :deep(.el-icon) {
  font-size: 35px !important;
  width: 35px;
  height: 35px;
}


/* Light mode 按钮 hover */
.light-button:hover {
  background: none;
  transform: scale(1.2);
}


/* 控制 el-dialog 的宽度和高度 */
:deep(.el-dialog) {
  width: 500px !important;
  height: 560px !important;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  margin-top: 160px !important; /* 调整这个数值来控制下移 */
}


/* 修改弹窗标题颜色 */
:deep(.el-dialog__title) {
  color: #44546A !important;
  font-weight: bold;
  margin: 16px;
  position: relative;
  top: 15px ; /* 根据需要上下调整 */
}


/* 让背景不变暗 */
:deep(.el-overlay) {
  background: transparent !important; /* 透明化背景 */
}

/* 让 X 按钮变白 */
:deep(.el-dialog__headerbtn .el-icon) {
  color: #44546A !important;
  font-size: 25px;
  font-weight: bold;
  transition: color 0.3s ease-in-out;
}

/* X 按钮 hover 时变色 */
:deep(.el-dialog__headerbtn:hover .el-icon) {
  color: #607D8B !important;
}


/* 🌈 颜色分类 Tabs */
.color-tabs {
  display: flex;
  gap: 30px;
  margin: 12px 20px;
}

.color-tab {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.3s ease-in-out;
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.1)); /* 图标阴影 */
}

/* 每个 tab 颜色对应背景 */
.color-tab:nth-child(1) { background-color: #C8E6C9; } /* Blue */
.color-tab:nth-child(2) { background-color: #B3E5FC; } /* Green */
.color-tab:nth-child(3) { background-color: #B39DDB; } /* Purple */
.color-tab:nth-child(4) { background-color: #FFF59D; } /* Purple */


.color-tab:hover {
  transform: scale(1.2);
}

/* 选中的 Tab */
.color-tab.active {
  transform: scale(1.2);
  border: 2px solid #FFFFFF;
}


.background-options {
  display: grid;                /* 改用grid布局 */
  grid-template-columns: repeat(3, 1fr); /* 每行3个 */
  gap: 8px;                    /* 元素之间的间距 */
  justify-items: center;        /* 水平居中 */
  align-items: center;          /* 垂直居中 */
  padding: 10px;                /* 根据需要微调内边距 */
}

/* 让背景名字显示在缩略图下方 */
.bg-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; /* 必须有这个 */
  transition: transform 0.4s ease-in-out;
}


/* 让壁纸名称变白 */
.bg-name {
  font-size: 15px;
  color: #44546A !important;
  margin-top: 10px;
  font-weight: bold;
}

.bg-thumbnail {
  width: 130px;
  height: 90px;
  border-radius: 6px;
  cursor: pointer;

  position: relative; /* 必须有这个 */
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.bg-thumbnail:hover {
  transform: scale(1.1);
  outline: 3px solid rgba(255,255,255,0.9);
}


.bg-item.active::after {
  content: "";
  position: absolute;
  top: 10px;
  left: 0;
  width: 130px; /* 与图片宽度完全一致 */
  height: 90px; /* 与图片高度完全一致 */
  border: 3px solid rgba(255,255,255,0.9); /* 白色边框 */
  border-radius: 6px;
  box-sizing: border-box;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  pointer-events: none; /* 防止干扰点击事件 */
}


</style>


