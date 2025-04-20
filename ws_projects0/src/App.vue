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
        <!-- 图标 -->
        <span class="icon-emoji">🤖</span>
        <!-- 文字 -->
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
const drawerWidth = ref(400) // 默认宽度

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
  width: 170px;             /* 默认宽度只够图标 */
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
  overflow: hidden;        /* 隐藏超出的文字部分 */
  pointer-events: auto;
  padding: 0px 20px;          /* 给图标一点左右内边距 */
}

/* 图标 + 文字容器 */
.bubble-icon {
  display: flex;
  align-items: center;
}

/* 图标的样式（单独调大小） */
.icon-emoji {
  font-size: 28px;  /* 图标更大 */
  margin-right: 6px;
}

/* 文字的样式（默认隐藏） */
.icon-text {
  font-size: 20px;
  font-weight: 600;
  color: #4E6B50;
  display: none;   /* 默认不显示 */
  white-space: nowrap; /* 防止自动换行 */
}

/* ============================= */
/* 当抽屉关闭且鼠标悬停时，展开按钮宽度并显示文字 */
/* ============================= */

.bubble-wrapper:not(.drawer-open):hover {
  background-color: rgb(197, 225, 165, 0.7);
  right: -36px !important;
}

/* 悬浮时显示文字 */
.bubble-wrapper:not(.drawer-open):hover .icon-text {
  display: inline-block;
}

/* ============================= */
/* 如果抽屉打开时，一直显示文字 */
/* ============================= */
.bubble-wrapper.drawer-open:hover {
  background-color: rgb(197, 225, 165, 0.7);

}


/* Navbar Styles */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 关键 */
  width: 100%;
  /* 线性渐变，方向从上到下 */
  background: linear-gradient(to bottom, #E8F5E9, #E0F2F1);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px 20px;
}

/* 让导航里所有 a 都去掉下划线，并指定文字颜色 */
.navbar a {
  text-decoration: none;     /* 去掉下划线 */
  color: #26A69A;
  font-weight: bold;
  font-size: 17px;
}

/* 悬停时也不要下划线 */
.navbar a:hover {
  text-decoration: none;
}

/* 选中的菜单项颜色 */
.navbar :deep(.el-menu-item.is-active) {
  border-bottom: 4px solid #80CBC4 !important; /* 蓝色指示线 */
}

/* 鼠标悬浮时的颜色 */
.navbar :deep(.el-menu-item:hover) {
  background-color: #B2DFDB !important;
  border-radius: 8px;
  transition: all 0.4s ease-in-out; /* 平滑过渡 */
}

/* 鼠标点击时的颜色 */
.navbar :deep(.el-menu-item:active) {
  background-color: #80CBC4 !important; /* 更深一点的绿色 */
}


/* 左侧容器：让链接水平排列并减少间距 */
.nav-left {
  display: flex;
  align-items: center;
  gap: 15px; /* 调整链接之间的间距，越小越紧凑 */

}

/* 右侧容器：让金币和头像对齐 */
.nav-right {
  display: flex;
  align-items: center;
  gap: 40px;
}

/* 覆盖 el-menu-item 的默认 padding，让链接更紧凑 */
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
  background:  #F9FBF7 !important; /* 确保背景透明 */
  margin: 0;
  height: 99vh;
  padding: 0px;
}


</style>



