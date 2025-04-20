<template>
  <div class="focus-timer-container" :style="{ backgroundImage: `url(${selectedBackground})` }">
    <!-- Countdown circle -->
    <div class="timer-circle">
      <svg width="300" height="300" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" stroke="rgb(245, 245, 245,1)" stroke-width="12" fill="none"/>
        <circle
            cx="100"
            cy="100"
            r="90"
            stroke="rgb(176, 190, 197,0.8)"
            stroke-width="12"
            fill="none"
            stroke-dasharray="565.48"
            :stroke-dashoffset="(remainingTime / totalDuration) * 565.48"
            stroke-linecap="round"
        />
      </svg>
      <span class="timer-text">{{ formattedTime }}</span>
    </div>

    <!-- Control buttons -->
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

<!--      <button class="light-button" @click="stopTimer(true)">-->
<!--        <el-icon><Check /></el-icon> Test-->
<!--      </button>-->

    </div>

    <!-- Background Panel -->
    <el-dialog v-model="showBackgroundPanel" title="Select Timer Background">
      <div>
        <!-- The circular Tab switches wallpapers of different colors -->
        <div class="color-tabs">
          <button
              v-for="(color, index) in Object.keys(backgroundCategories)"
              :key="index"
              :class="{ active: activeTab === color }"
              class="color-tab"
              @click="activeTab = color">
          </button>
        </div>

        <!-- The currently selected background image -->
        <div class="background-options">
          <div v-for="(bg, index) in backgroundCategories[activeTab]" :key="index" class="bg-item">
            <img
                :src="bg"
                class="bg-thumbnail"
                @click="setBackground(bg)"
            />
            <p class="bg-name">{{ getBackgroundName(bg) }}</p>
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
        <!-- If sound.img is empty, the image will not be rendered -->
        <img v-if="sound.img" :src="sound.img" class="sound-thumbnail" />
        <!-- If there is no picture, display the default blank circle-->
        <div v-else class="sound-thumbnail none-thumbnail"></div>
        <div class="sound-name">{{ sound.label }}</div>
      </div>
    </div>

    <!-- audio  -->
    <audio ref="audioPlayer" loop></audio>
  </el-dialog>

  </div>
</template>


<script setup>
import {ref, computed, onMounted, onUnmounted} from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import {Picture, Headset, VideoPause, VideoPlay, Remove, Check} from '@element-plus/icons-vue'

const route = useRoute();
const router = useRouter();

// Obtain the duration of the task setting from the URL.
const totalDuration = ref(Number(route.query.duration) * 60|| 30 * 60);
const remainingTime = ref(totalDuration.value);
const isPaused = ref(false);
let timer = null;

const userId = ref(localStorage.getItem("userId"));

import { userTaskStore } from "../store/store.js";
import {storeToRefs} from "pinia";
import {ElMessage, ElMessageBox} from "element-plus";

const taskStore = userTaskStore();
const { userCoins } = storeToRefs(taskStore);
const { selectedTask } = storeToRefs(taskStore);
const { completedTasks } = storeToRefs(taskStore);


// Calculate the countdown format (MM:SS)
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
});


const startTime = ref(null);


const startTimer = () => {
  if (timer) return;
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--;
    } else {
      stopTimer(true); //After the timing ends, complete the task normally
    }
  }, 1000);
};


const pauseTimer = () => {
  isPaused.value = true;
  clearInterval(timer);
  timer = null;
};


const resumeTimer = () => {
  isPaused.value = false;
  startTimer();
};


const stopTimer = (isCompleted = false) => {
  clearInterval(timer);
  timer = null;

  const message = isCompleted
      ? "Focus time is over! You obtain reward coins. 🎉"
      : "You gave up! No coins awarded.";

  ElMessageBox.confirm(
      message,
      {
        confirmButtonText: 'OK',
        type: isCompleted ? 'success' : 'warning',
        showCancelButton: false,
        closeOnClickModal: false,
        showClose: false,
      }
  )
      .then(() => {
        remainingTime.value = totalDuration.value * 60; // Reset countdown
        router.push("/task-management"); // Return to the homepage
      });


  const durationInSeconds = totalDuration.value; // Make sure the duration is in seconds
// endTime = startTime + duration
  const endTime = new Date(startTime.value.getTime() + durationInSeconds * 1000);

  // If isCompleted, send an axios request to store it in the database
  if (isCompleted) {
    saveFocusTimerData(endTime);
  }

  // If a selectedTask is completed, update the points and task status at the front end
  if (isCompleted && selectedTask.value) {
    updateUserCoins(selectedTask.value.rewardCoins);
    completedTasks.value.push(selectedTask.value);
    selectedTask.value = null;
  }

};


const saveFocusTimerData = async (endTime) => {
  try {
    const taskName = selectedTask.value
        ? selectedTask.value.taskName
        : "Unnamed";

    const response = await axios.post("http://localhost:8080/focusTimer/saveFocus", {
      userId: userId.value,
      taskName: taskName,
      duration: totalDuration.value,
      successful: true,
      startTime: startTime.value.toISOString(),
      endTime: endTime.toISOString(),
    });

    console.log("Focus timer data saved:", response.data);
  } catch (err) {
    console.error("Failed to save focus timer data:", err);
  }
};


// Update user coins
const updateUserCoins = async (rewardCoins) => {
  try {
    await axios.post("http://localhost:8080/user/updateCoins", {
      userId: userId.value,
      rewardCoins: Number(rewardCoins)
    });

    userCoins.value += rewardCoins;
  } catch (err) {
    console.error("Failed to update coins:", err);
  }
};

// The countdown is initiated when the component is mounted
onMounted(() => {
  startTime.value = new Date();
  startTimer();
});

// Clear the timer when the component is unloaded
onUnmounted(() => {
  clearInterval(timer);
});


const showBackgroundPanel = ref(false);

// Wallpapers of the Green category are displayed by default
const activeTab = ref("Green");

// Default background
const selectedBackground = ref("src/wallpaper/Green/DayStudy.png");

const backgroundCategories = ref({
  "Green": [
    "src/wallpaper/Green/DayStudy.png",
    "src/wallpaper/Green/ForestStation.png",
    "src/wallpaper/Green/RainyStreet.png",
    "src/wallpaper/Green/ButterflyForest.png",
    "src/wallpaper/Green/GrassLand.png",
    "src/wallpaper/Green/CourtyardWater.png",
    "src/wallpaper/Green/Friendship.png",
    "src/wallpaper/Green/ForestBeam.png",
    "src/wallpaper/Green/Lake.png"
  ],
  "Blue": [
    "src/wallpaper/Blue/NightStudy.png",
    "src/wallpaper/Blue/EveningStreet.png",
    "src/wallpaper/Blue/Sea.png",
    "src/wallpaper/Blue/Store.png",
    "src/wallpaper/Blue/UrbanRoad.png",
    "src/wallpaper/Blue/SnowMountain.png",
    "src/wallpaper/Blue/CloudSea.png",
    "src/wallpaper/Blue/Boat.png",
    "src/wallpaper/Blue/Shanshui.png",
  ],
  "Purple": [
    "src/wallpaper/Purple/WinterCity.png",
    "src/wallpaper/Purple/Room.png",
    "src/wallpaper/Purple/Landscape.jpg",
    "src/wallpaper/Purple/Moon.jpg",
    "src/wallpaper/Purple/EvenfallStreet.png",
    "src/wallpaper/Purple/Sunset.png",
    "src/wallpaper/Purple/RiverBank.png",
    "src/wallpaper/Purple/FlowerField.png",
    "src/wallpaper/Purple/Bridge.jpg",
  ],
  "Yellow": [
    "src/wallpaper/Yellow/AutumnCity.jpg",
    "src/wallpaper/Yellow/Room.png",
    "src/wallpaper/Yellow/FlowerWindow.png",
    "src/wallpaper/Yellow/LondonKitty.png",
    "src/wallpaper/Yellow/SunsetSea.png",
    "src/wallpaper/Yellow/FlowerField.jpg",
    "src/wallpaper/Yellow/Forest.jpg",
    "src/wallpaper/Yellow/Sunrise.jpg",
    "src/wallpaper/Yellow/Shanshui.jpg",
  ]
});


const getBackgroundName = (bg) => {
  const name = bg.split("/").pop().replace(/\.(png|jpg|jpeg)$/i, "");
  return name
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
};


// Switch the background
const setBackground = (bg) => {
  console.log("Selected background path:", bg);
  selectedBackground.value = bg;
};


const showSoundPanel = ref(false);

// Default: No sound
const selectedSound = ref("none");

// Sound List
const soundList = ref([
  { value: "none", label: "None", img: "", audio: "" },
  { value: "Forest", label: "Forest", img: "/src/sound/cover/Forest.jpg", audio: "/src/sound/Forest.mp3" },
  { value: "Brook", label: "Brook", img: "/src/sound/cover/Brook.jpg", audio: "/src/sound/Brook.mp3" },
  { value: "Wave", label: "Wave", img: "/src/sound/cover/Wave.jpeg", audio: "/src/sound/Wave.mp3" },
  { value: "Rain", label: "Rain", img: "/src/sound/cover/Rain.jpg", audio: "/src/sound/Rain.mp3" },
  { value: "Fireplace", label: "Fireplace", img: "/src/sound/cover/Fire.jpg", audio: "/src/sound/Fire.mp3" },
  { value: "Write", label: "Write", img: "/src/sound/cover/Write.jpg", audio: "/src/sound/Write.mp3" },
  { value: "City", label: "City", img: "/src/sound/cover/City.jpg", audio: "/src/sound/City.mp3" },
  { value: "Piano", label: "Piano", img: "/src/sound/cover/Piano.jpg", audio: "/src/sound/Piano.mp3" },

]);

const audioPlayer = ref(null);


const setSound = (sound) => {
  selectedSound.value = sound;

  if (sound === 'none') {
    audioPlayer.value.pause();
    audioPlayer.value.src = '';
  } else {
    const selectedAudio = soundList.value.find(s => s.value === sound).audio;
    audioPlayer.value.src = selectedAudio;

    // Adjust the volume separately according to the type of sound effect
    if (sound === 'Rain' || sound === 'Forest') {
      audioPlayer.value.volume = 0.2;   // rain and forest have been reduced to 30%
    } else {
      audioPlayer.value.volume = 1;   // Other sound effects default to 100%
    }

    audioPlayer.value.play();
  }
};


</script>


<style scoped>
.sound-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  row-gap: 22px;
  column-gap: 8px;
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
  position: relative;
  transition: transform 0.4s ease-in-out;
}

.sound-thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  box-shadow: 0 2px 5px rgba(0,0,0,0.5);
}

.none-thumbnail {
  background-color: rgba(255,255,255,0.5);
}


.sound-item.active::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100px;
  height: 100px;
  border: 3px solid rgba(255,255,255,0.9);
  border-radius: 50%;
  box-sizing: border-box;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  pointer-events: none;
}


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
  height: 98vh;
  font-family: Arial, sans-serif;
  margin-top: 0px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
  z-index: 1;

  /* Add a semi-transparent mask */
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
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
}

.timer-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
  font-weight: bold;
  color: white;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.5);
}

.timer-controls {
  margin-top: 380px;
  display: flex;
  gap: 40px;

}


.light-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 19px;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  text-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5));
}

.light-button :deep(.el-icon) {
  font-size: 35px !important;
  width: 35px;
  height: 35px;
}

.light-button:hover {
  background: none;
  transform: scale(1.2);
}


:deep(.el-dialog) {
  width: 500px !important;
  height: 560px !important;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.75) !important;
  backdrop-filter: blur(3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  margin-top: 160px !important;
}


:deep(.el-dialog__title) {
  color: #44546A !important;
  font-weight: bold;
  margin: 16px;
  position: relative;
  top: 15px ;
}


:deep(.el-overlay) {
  background: transparent !important;
}


:deep(.el-dialog__headerbtn .el-icon) {
  color: #44546A !important;
  font-size: 25px;
  font-weight: bold;
  transition: color 0.3s ease-in-out;
}


:deep(.el-dialog__headerbtn:hover .el-icon) {
  color: #607D8B !important;
}


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
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.1));
}

/* Each tab color corresponds to the background */
.color-tab:nth-child(1) { background-color: #C8E6C9; } /* Blue */
.color-tab:nth-child(2) { background-color: #B3E5FC; } /* Green */
.color-tab:nth-child(3) { background-color: #B39DDB; } /* Purple */
.color-tab:nth-child(4) { background-color: #FFF59D; } /* Purple */


.color-tab:hover {
  transform: scale(1.2);
}

.color-tab.active {
  transform: scale(1.2);
  border: 2px solid #FFFFFF;
}


.background-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  justify-items: center;
  align-items: center;
  padding: 10px;
}


.bg-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.4s ease-in-out;
}


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

  position: relative;
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
  width: 130px;
  height: 90px;
  border: 3px solid rgba(255,255,255,0.9);
  border-radius: 6px;
  box-sizing: border-box;
  box-shadow: 0 0 5px rgba(0,0,0,0.2);
  pointer-events: none;
}


</style>


