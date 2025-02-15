<template>
  <div class="signup-container">
    <h1>Create an Account</h1>
<!--    <input v-model="username" placeholder="Username" class="input-field" />-->
<!--    <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="Password" class="input-field" />-->
    <!-- 用户名输入框 -->
    <input v-model="username" @input="handleUsernameInput" placeholder="Username" class="input-field" />
    <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
    <!-- 密码输入框 -->
    <input :type="showPassword ? 'text' : 'password'" v-model="password" @input="handlePasswordInput" placeholder="Password" class="input-field"/>
    <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
    <!-- 确认密码输入框 -->
    <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" @input="handleConfirmPasswordInput" placeholder="Confirm Password" class="input-field"/>
    <p v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</p>

<!--    <p class="note">Minimum of 8 characters</p>-->
    <button @click="signup" class="signup-btn">Create an Account</button>
    <p v-if="generalError" class="error-message">{{ generalError }}</p>
    <p>Already have an account? <router-link to="/">Log in here</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from "sweetalert2";

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const usernameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const generalError = ref('');
const router = useRouter();

// 原来的: 无论输入什么直接注册
// const signup = () => {
//   if (username.value && password.value.length >= 8) {
//     alert('Account created successfully!');
//     router.push('/');
//   } else {
//     alert('Make sure username and password are valid (at least 8 characters)');
//   }
// };


let debounceTimer = null; // 用于防抖的计时器

/** 🔍 处理输入时触发防抖检查 */
const handleUsernameInput = () => {
  clearTimeout(debounceTimer); // 取消上次的计时器
  debounceTimer = setTimeout(() => {
    checkUsernameExists();
  }, 500); // 等待 500ms
};

/** 🔍 检查用户名是否已存在 */
const checkUsernameExists = async () => {
  // if (!username.value.trim()) {
  //   usernameError.value = ""; // 允许用户名为空，不报错
  //   return;
  // }

  try {
    const response = await axios.get(`http://localhost:8080/user/check-existUser`, {
      params: { username: username.value }
    });

    if (response.data.exists) {
      usernameError.value = "Username is already taken.";
    } else {
      usernameError.value = ""; // 用户名可用，不显示错误
    }
  } catch (error) {
    console.error("Error checking username:", error);
    usernameError.value = "Error checking username.";
  }
};

/** 实时检查密码 */
const handlePasswordInput = () => {
  if (password.value.length < 8) {
    passwordError.value = "Password must be at least 8 characters long.";
  } else {
    passwordError.value = "";
  }

  // 当密码改变时，也要检查确认密码是否匹配
  handleConfirmPasswordInput();
};

/** 实时检查确认密码 */
const handleConfirmPasswordInput = () => {
  if (confirmPassword.value && confirmPassword.value !== password.value) {
    confirmPasswordError.value = "Passwords do not match.";
  } else {
    confirmPasswordError.value = "";
  }
};

/** 处理注册逻辑 */
const signup = async () => {
  if (usernameError.value || passwordError.value || confirmPasswordError.value) {
    generalError.value = "Please fix errors before submitting.";
    return;
  }

  try {
    const response = await axios.post("http://localhost:8080/user/signup", {
      username: username.value,
      password: password.value,
    });

    // alert("Account created successfully!");
    // 使用 SweetAlert2 美化弹框
    await Swal.fire({
      title: "Success!",
      text: "Account created successfully!",
      icon: "success",
      confirmButtonText: "OK",
      timer: 3000, // 2秒后自动关闭
      timerProgressBar: true,
    });

    router.push("/");
  } catch (error) {
    generalError.value = error.response?.data?.error || "Registration failed.";
  }
};
</script>

<style scoped>
/* 全局白色背景 */
body {
  background-color: white;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}

.signup-container {
  max-width: 480px;
  margin: 100px auto;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  text-align: center;
  box-shadow: none;
  border: none;
}

/* 标题样式 */
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

/* 按钮样式 */
.signup-btn {
  background-color: #007bff;
  margin: 10px 0;
  color: white;
  border: none;
  padding: 12px;
  width: 100%;
  cursor: pointer;
  border-radius: 5px;
  font-size: 16px;
}

.signup-btn:hover {
  background-color: #0056b3;
}

/* 辅助文字 */
p {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

a {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}
</style>


