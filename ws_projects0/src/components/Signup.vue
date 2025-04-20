<template>
  <div class="signup-container">
    <h1>🌱 Sprout</h1>
    <!-- User name input field -->
    <input v-model="username" @input="handleUsernameInput" placeholder="Username" class="input-field" />
    <p v-if="usernameError" class="error-message">{{ usernameError }}</p>
    <!-- Password input field -->
    <input :type="showPassword ? 'text' : 'password'" v-model="password" @input="handlePasswordInput" placeholder="Password" class="input-field"/>
    <p v-if="passwordError" class="error-message">{{ passwordError }}</p>
    <!-- Confirm the password input box -->
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
import {ElMessage} from "element-plus";

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const usernameError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const generalError = ref('');
const router = useRouter();


let debounceTimer = null;

// Trigger the anti-shake check when processing the input
const handleUsernameInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    checkUsernameExists();
  }, 500);
};


const checkUsernameExists = async () => {

  try {
    const response = await axios.get(`http://localhost:8080/user/check-existUser`, {
      params: { username: username.value }
    });

    if (response.data.exists) {
      usernameError.value = "Username is already taken.";
    } else {
      usernameError.value = ""; // The username is available and no error is displayed
    }
  } catch (error) {
    console.error("Error checking username:", error);
    usernameError.value = "Error checking username.";
  }
};

//Check passwords in real time
const handlePasswordInput = () => {
  if (password.value.length < 8) {
    passwordError.value = "Password must be at least 8 characters long.";
  } else {
    passwordError.value = "";
  }

  // When the password changes, also check and confirm whether the password matches
  handleConfirmPasswordInput();
};

// Check and confirm passwords in real time
const handleConfirmPasswordInput = () => {
  if (confirmPassword.value && confirmPassword.value !== password.value) {
    confirmPasswordError.value = "Passwords do not match.";
  } else {
    confirmPasswordError.value = "";
  }
};


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

   ElMessage.success("Account created successfully!");
    router.push("/");
  } catch (error) {
    generalError.value = error.response?.data?.error || "Registration failed.";
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

.signup-container {
  max-width: 100%;
  height: 105vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
  width: 30%;
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

.signup-btn {
  font-weight: bold;
  background-color: #4DB6AC;
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

.signup-btn:hover {
  background-color: #26A69A;
}

/* Auxiliary text */
p {
  margin-top: 15px;
  font-size: 16px;
  color: #4e6b50;
}

a {
  color: #26A69A;
  text-decoration: none;
  font-weight: bold;
}

a:hover {
  text-decoration: underline;
}
</style>


