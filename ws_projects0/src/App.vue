<template>
  <div id="app">
    <!-- Navigation Bar (only shows on Home page) -->
    <nav v-if="showNavbar" class="navbar">
      <div class="nav-left">
        <router-link to="/home" class="nav-link">Task Management</router-link>
        <router-link to="/virtual-store" class="nav-link">Virtual Store</router-link>
        <router-link to="/focus-timer" class="nav-link">Focus Timer</router-link>
        <router-link to="/calendar" class="nav-link">Calendar</router-link>
        <router-link to="/data-dashboard" class="nav-link">Data Dashboard</router-link>
      </div>
      <!-- User Info Section -->
      <div class="nav-right">
        <div class="user-profile" @click="toggleDropdown">
          <img :src="userAvatar" alt="User Avatar" class="avatar" />
        </div>
        <div v-if="showDropdown" class="dropdown-menu">
          <div class="menu-item"><strong>Username:</strong> {{ userName }}</div>
<!--          <div class="menu-item"><strong>User ID:</strong> {{ userId }}</div>-->
          <hr class="divider" /> <!-- 分割线 -->
          <button @click="logout" class="logout-btn">Logout</button>
        </div>
      </div>
    </nav>

<!--    &lt;!&ndash; Logout Button (fixed at the top right corner) &ndash;&gt;-->
<!--    <button v-if="showNavbar" class="logout-btn" @click="logout">Logout</button>-->

    <!-- Router View -->
    <router-view></router-view>
  </div>
</template>

<script setup>
import {computed, ref} from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

// Show Navbar only on /home and related pages
const showNavbar = computed(() => route.path !== '/' && route.path !== '/signup');

// 用户信息
const userId = ref(localStorage.getItem("userId"));
const userName = ref(localStorage.getItem("userName"));
const userAvatar = ref("https://api.iconify.design/heroicons:user-circle.svg"); // 默认头像

// 下拉菜单控制
const showDropdown = ref(false);
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
};

// Logout Function
const logout = () => {
  // localStorage.removeItem('token');
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");
  router.push('/');
};
</script>

<style scoped>
/* Navbar Styles */
.navbar {
  width: 99%;  /* 让导航栏铺满整个屏幕 */
  margin: 0 auto;  /* 让导航栏居中 */
  background-color: #e3f2fd; /* Light blue background */
  padding: 10px 10px;
  display: flex;
  justify-content: space-between; /* 左右两边对齐 */
  align-items: center;
  font-weight: bold;
  border-radius: 12px; /* Rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
  flex-wrap: wrap;  /* 允许在小屏幕换行 */
}

/* 左侧导航菜单 */
.nav-left {
  display: flex;
  gap: 10px;  /* 让前面的文字靠近一些 */
  flex-grow: 1;  /* 让左侧占据更多空间 */
}

/* 右侧用户信息 */
.nav-right {
  display: flex;
  align-items: center;
  margin-left: auto;  /* 推动到最右 */
  position: relative;
}

/* Navigation Links */
.nav-link {
  color: #1565c0;  /* Darker blue for contrast */
  text-decoration: none;
  padding: 10px 15px;
  transition: background-color 0.4s, color 0.4s; /* Smooth hover transition */
  border-radius: 8px; /* Slightly rounded corners for links */
}

/* Hover Effect */
.nav-link:hover {
  background-color: #bbdefb; /* Lighter blue on hover */
  color: #0d47a1;           /* Darker text color on hover */
}


/* 头像区域 */
.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 10px;
  transition: background-color 0.4s, color 0.4s; /* Smooth hover transition */
}

.avatar:hover {
  background-color: #bbdefb; /* Lighter blue on hover */
  color: #0d47a1;           /* Darker text color on hover */
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: 50px;
  right: 0;
  width: 200px; /* 让菜单更大 */
  background: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.15); /* 增加阴影 */
  font-size: 14px;
}


/* 菜单项 */
.menu-item {
  padding: 8px 12px;
  color: #333;
}

/* 分割线 */
.divider {
  border: none;
  height: 1px;
  background: #ddd;
  margin: 10px 0;
}

/* 退出按钮（与菜单字体一致） */
.logout-btn {
  width: 100%;
  text-align: center;
  padding: 10px;
  background: none;
  border: none;
  color: #d9534f;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #f8d7da;
}

/* General App Styles */
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: white;
  margin: 0;
  padding: 0;
}
</style>



