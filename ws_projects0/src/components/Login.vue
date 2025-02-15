<template>
  <div class="login-container">
    <h1>Log In</h1>
    <input v-model="username" placeholder="Username" class="input-field" />
    <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" class="input-field" />
    <button @click="login" class="login-btn">Login</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p>Don't have an account? <router-link to="/signup">Sign up here</router-link></p>
  </div>

</template>

<script setup>
import {nextTick, ref} from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');  // 用户名输入
const password = ref('');  // 密码输入
const showPassword = ref(false); // 控制密码显示/隐藏
const errorMessage = ref(''); // 存储错误信息
const router = useRouter();

// 原来的: 无论输入什么直接登录
// const login = () => {
//   if (username.value && password.value) {
//     localStorage.setItem('token', 'mock-token');
//     router.push('/home');
//   } else {
//     alert('Please enter username and password');
//   }
// };


// 处理用户登录
const login = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = "Please enter username and password";
    return;
  }

  try {
    // 发送 API 请求到后端
    const response = await axios.post("http://localhost:8080/user/login", {
      username: username.value,
      password: password.value
    });

    // 登录成功，存储用户 ID 并跳转
    localStorage.setItem("userId", response.data.userId);
    localStorage.setItem("userName", username.value); // 现在存储 username
    router.push("/home"); // 跳转到首页

  } catch (error) {
    // 处理登录失败的情况
    errorMessage.value = "Invalid username or password";
  }
};

</script>

<style scoped>
body {
  background-color: white;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.login-container {
  max-width: 480px;
  margin: 100px auto;
  padding: 20px;
  background-color: white;   /* 保持白色背景 */
  border-radius: 10px;
  text-align: center;
  box-shadow: none; /* 移除阴影 */
  border: none;     /* 移除边框 */
}

h1 {
  color: #333;
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 14px;
}

.error-message {
  color: #666;
  font-size: 12px;
  text-align: left;
  margin: 2px 0 10px 5px;
}


.login-btn {
  background-color: #42b983;
  margin: 10px 0;
  color: white;
  border: none;
  padding: 12px;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}

.login-btn:hover {
  background-color: #36876a;
}

p {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

a {
  color: #42b983;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}
</style>



