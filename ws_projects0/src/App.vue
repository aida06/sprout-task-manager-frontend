<template>
  <div id="app">
    <el-menu
        v-if="showNavbar"
        mode="horizontal"
        class="navbar"
    >
      <!-- Left container: nav-left -->
      <div class="nav-left">
        <el-menu-item index="1">
          <router-link to="/task-management">📝 Task Management</router-link>
        </el-menu-item>
        <el-menu-item index="2">
          <router-link to="/sprout-island">🌱 Sprout Island</router-link>
        </el-menu-item>
<!--        <el-menu-item index="3">-->
<!--          <router-link to="/focus-timer">⏳ Focus Timer</router-link>-->
<!--        </el-menu-item>-->
        <el-menu-item index="4">
          <router-link to="/schedule">📅 Schedule</router-link>
        </el-menu-item>
        <el-menu-item index="5">
          <router-link to="/data-dashboard">📊 Data Dashboard</router-link>
        </el-menu-item>
        <el-menu-item index="6">
          <router-link to="/badges">🎖️ Badges</router-link>
        </el-menu-item>
        <el-menu-item index="7">
          <router-link to="/help">💡 Help</router-link>
        </el-menu-item>
      </div>

      <!-- Right container: nav-right -->
      <div class="nav-right">
        <span class="user-coins">💰 {{ userCoins }}</span>
        <el-dropdown>
          <el-avatar :src="userAvatar" alt="User Avatar" class="avatar"></el-avatar>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>{{ userName }}</el-dropdown-item>
              <el-dropdown-item divided @click="logout">Logout</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-menu>

    <!-- Router View -->
    <router-view></router-view>

    <!-- Hover button, position = drawerWidth + 20px (or return to 40px if showAiDrawer is false) -->
    <div
        v-if="showNavbar"
        class="bubble-wrapper"
        :class="{ 'drawer-open': showAiDrawer }"
        :style="bubbleStyle"
        @click="toggleAiDrawer"
    >
      <div class="bubble-icon">
        <span class="icon-emoji">🤖</span>
        <span class="icon-text">AI Chatbot</span>
      </div>
    </div>

    <AiChatbot
        :visible="showAiDrawer"
        @close="showAiDrawer = false"
        @update:width="onDrawerWidthChange"
    />

  </div>
</template>



<script setup>
import {computed, onMounted, ref} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { userTaskStore } from "./store/store.js";
import axios from "axios";
import {storeToRefs} from "pinia";
import AiChatbot from './components/AIChatbot.vue'

const route = useRoute();
const router = useRouter();

// Show Navbar only on /home and related pages
const showNavbar = computed(() => route.path !== '/' && route.path !== '/signup' && route.path !== '/focus-timer');

// User information
const userId = ref(localStorage.getItem("userId"));
const userName = ref(localStorage.getItem("userName"));
const userAvatar = ref("https://api.iconify.design/heroicons:user-circle.svg"); // Default avatar

const taskStore = userTaskStore();
const { userCoins } = storeToRefs(taskStore);


// Drop-down menu control
const showDropdown = ref(false);
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// Logout Function
const logout = () => {
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  router.push('/');
};

// Obtain user credits
const fetchUserCoins = async () => {
  if (!userId.value) return; // If userId is empty, avoid the request

  try {
    const response = await axios.get("http://localhost:8080/user/coins", {
      params: { userId: userId.value }
    });
    userCoins.value = response.data;
  } catch (err) {
    console.error("Failed to fetch user coins:", err);
  }
};

// Get user coins when the page loads
onMounted(fetchUserCoins);

// onMounted(async () => {
//   await fetchUserCoins();
// });

// ===========================
// AI Helper related section
// ===========================
const showAiDrawer = ref(false)
const drawerWidth = ref(400)

function toggleAiDrawer() {
  showAiDrawer.value = !showAiDrawer.value
}

// Drawer drag-and-drop updates width callback
function onDrawerWidthChange(newW) {
  drawerWidth.value = newW
}


const bubbleStyle = computed(() => {
  if (showAiDrawer.value) {
    return {
      right: `${drawerWidth.value - 138}px`,
      zIndex: 999
    }
  } else {
    return {
      right: '-138px',
      zIndex: 999
    }
  }
})

</script>



<style scoped>

.bubble-wrapper {
  position: fixed;
  bottom: 240px;
  width: 170px;
  height: 50px;
  border-radius: 50px;
  background-color: #DCEDC8;
  box-shadow: 0 4px 8px rgba(0,0,0,0.16);
  cursor: pointer;
  transition: right 0.4s ease;
  z-index: 998;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  user-select: none;
  overflow: hidden;
  pointer-events: auto;
  padding: 0px 20px;
}


.bubble-icon {
  display: flex;
  align-items: center;
}

/* The style of the icon (resized separately) */
.icon-emoji {
  font-size: 28px;
  margin-right: 6px;
}

/* Text style (hidden by default) */
.icon-text {
  font-size: 20px;
  font-weight: 600;
  color: #4E6B50;
  display: none;
  white-space: nowrap; /* Prevent automatic line breaks */
}


/* When the drawer is closed and the mouse hovers, expand the button width and display the text */
.bubble-wrapper:not(.drawer-open):hover {
  background-color: rgb(197, 225, 165, 0.7);
  right: -36px !important;
}

/* Display text when suspended */
.bubble-wrapper:not(.drawer-open):hover .icon-text {
  display: inline-block;
}


/* If the drawer keeps showing text when it is opened */
.bubble-wrapper.drawer-open:hover {
  background-color: rgb(197, 225, 165, 0.7);

}


/* Navbar Styles */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: linear-gradient(to bottom, #E8F5E9, #E0F2F1);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px 20px;
}


.navbar a {
  text-decoration: none;     /* Remove the underline*/
  color: #26A69A;
  font-weight: bold;
  font-size: 17px;
}

.navbar a:hover {
  text-decoration: none;
}

.navbar :deep(.el-menu-item.is-active) {
  border-bottom: 4px solid #80CBC4 !important;
}

.navbar :deep(.el-menu-item:hover) {
  background-color: #B2DFDB !important;
  border-radius: 8px;
  transition: all 0.4s ease-in-out;
}

.navbar :deep(.el-menu-item:active) {
  background-color: #80CBC4 !important;
}


/* Left container: Arrange the links horizontally and reduce the spacing */
.nav-left {
  display: flex;
  align-items: center;
  gap: 15px;

}

/* Right container: Align the gold coins with the avatars */
.nav-right {
  display: flex;
  align-items: center;
  gap: 40px;
}


:deep(.el-menu-item) {
  padding: 0 4px !important;
}


.user-coins {
  font-size: 30px;
  font-weight: bold;
  color: #FFB300;
}


.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  background-color: #B2DFDB;
  transition: background-color 0.4s, color 0.4s; /* Smooth hover transition */
}


.avatar:hover {
  background-color: #B2DFDB; /* Lighter blue on hover */

}


/* General App Styles */
#app {
  font-family: 'Segoe UI', sans-serif;
  background:  #F9FBF7 !important;
  margin: 0;
  height: 99vh;
  padding: 0px;
}


</style>



