<template>
  <div id="app">
    <!-- 用 Element Plus 的 <el-menu> 作为容器 -->
    <el-menu
        mode="horizontal"
        class="navbar"
    >
      <!-- 左侧容器：nav-left -->
      <div class="nav-left">
        <!-- 放菜单项 -->
        <el-menu-item index="1">
          <router-link to="/home">📝 Task Management</router-link>
        </el-menu-item>
        <el-menu-item index="2">
          <router-link to="/virtual-scene">🌱 Sprout Island</router-link>
        </el-menu-item>
        <el-menu-item index="3">
          <router-link to="/focus-timer">⏳ Focus Timer</router-link>
        </el-menu-item>
        <el-menu-item index="4">
          <router-link to="/calendar">📅 Schedule</router-link>
        </el-menu-item>
        <el-menu-item index="5">
          <router-link to="/data-dashboard">📊 Data Dashboard</router-link>
        </el-menu-item>
      </div>

      <!-- 右侧容器：nav-right -->
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
  </div>
</template>



<script setup>
import {computed, onMounted, provide, ref} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { userTaskStore } from "./store/store.js";
import axios from "axios";
import {storeToRefs} from "pinia";

const route = useRoute();
const router = useRouter();

// Show Navbar only on /home and related pages
const showNavbar = computed(() => route.path !== '/' && route.path !== '/signup');

// 用户信息
const userId = ref(localStorage.getItem("userId"));
const userName = ref(localStorage.getItem("userName"));
const userAvatar = ref("https://api.iconify.design/heroicons:user-circle.svg"); // 默认头像

const taskStore = userTaskStore();
const { userCoins } = storeToRefs(taskStore);


// 下拉菜单控制
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

// **获取用户积分**
const fetchUserCoins = async () => {
  if (!userId.value) return; // **如果 userId 为空，避免请求**

  try {
    const response = await axios.get("http://localhost:8080/user/coins", {
      params: { userId: userId.value }
    });
    userCoins.value = response.data; // **确保正确存储数据**
  } catch (err) {
    console.error("Failed to fetch user coins:", err);
  }
};

// **页面加载时获取用户积分**
onMounted(fetchUserCoins);

// onMounted(async () => {
//   await fetchUserCoins();
// });
</script>

<style scoped>
/* Navbar Styles */
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between; /* 关键 */
  width: 100%;
  /* 其他属性可以保持 */
  /* 线性渐变，方向从上到下 */
  background: linear-gradient(to bottom, #E8F5E9, #E0F2F1);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 30px 20px;

}

/* 让导航里所有 a 都去掉下划线，并指定文字颜色 */
.navbar a {
  text-decoration: none;     /* 去掉下划线 */
  color: #26A69A;     /* 字体 */
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
  background-color: #B2DFDB !important; /* 绿色背景 */

  border-radius: 8px; /* 让悬浮有一点圆角 */
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
  transition: background-color 0.4s, color 0.4s; /* Smooth hover transition */
}


.avatar:hover {
  background-color: #B2DFDB; /* Lighter blue on hover */

}


/* General App Styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background: transparent !important; /* 确保背景透明 */
  margin: 0;
  padding: 0px;
}
</style>



