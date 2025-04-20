<template>
  <div class="login-container">
    <h1>🌱 Sprout</h1>
<!--    <h2>Log In</h2>-->
    <input v-model="username" placeholder="Username" class="input-field" />
    <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" class="input-field" />
    <button @click="login" class="login-btn">Login</button>
    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <p>Don't have an account? <router-link to="/signup">Sign up here</router-link></p>
  </div>

</template>

<script setup>
import {ref} from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');
const router = useRouter();


// Processing user login
const login = async () => {
  if (!username.value || !password.value) {
    errorMessage.value = "Please enter username and password";
    return;
  }

  try {
    const response = await axios.post("http://localhost:8080/user/login", {
      username: username.value,
      password: password.value
    });

    // Log in successfully, store the user ID and jump
    localStorage.setItem("userId", response.data.userId);
    localStorage.setItem("userName", username.value);   // store username
    router.push("/task-management");   // Go to task-management page

  } catch (error) {
    // Handle login failures
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
  max-width: 100%; /* 设置容器最大宽度 */
  height: 105vh;    /* 设置容器填充屏幕高度 */
  display: flex;
  flex-direction: column;  /* 竖直排列子元素 */
  justify-content: center; /* 居中对齐 */
  align-items: center;     /* 水平居中 */
  padding: 20px;
  background-color: #F9FBF7;
  border-radius: 10px;
  text-align: center;
  box-shadow: none;
  border: none;
  margin: -100px auto;
}

h1 {
  font-size: 40px;
  font-family: "Comic Sans MS", sans-serif;
  color: #4e6b50;
  font-weight: bold;
  margin-bottom: 45px;
  text-shadow: 0px 2px 5px rgba(0, 0, 0, 0);
}

h2 {
  color: #4e6b50;
  margin-bottom: 20px;
}

.input-field {
  width: 30%; /* 宽度适应屏幕 */
  padding: 15px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.error-message {
  color: #4e6b50;
  font-size: 16px;
  text-align: left;
  margin: 2px 0 10px 5px;
}

.login-btn {
  font-weight: bold;
  background-color: #81C784;
  margin: 10px 0;
  color: white;
  border: none;
  padding: 12px;
  width: 30%;
  cursor: pointer;
  border-radius: 5px;
  font-size: 19px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}

.login-btn:hover {
  background-color: #66BB6A;
}

p {
  margin-top: 15px;
  font-size: 16px;
  color: #4e6b50;
}

a {
  color: #66BB6A;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}
</style>




