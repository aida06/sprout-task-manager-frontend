<template>
  <div class="badges-container">
    <!-- 第一行: Sprout Island 和 Timer -->
    <div class="badge-row">
      <!-- Sprout Island Badges -->
      <div class="badge-category">
        <h2>Sprout Island Badges</h2>
        <div class="badge-items">
          <!-- LV1 Badge: Display if belongingsCount is 5 or more -->
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 5 items on Sprout Island" placement="bottom">
              <div class="badge-box">
                <img v-if="belongingsCount >= 5" src="/src/badges/sprout1.png" alt="Sprout Badge" />
              </div>
            </el-tooltip>
            <p>Sprout LV1</p>
          </div>

          <!-- LV2 Badge: Display if belongingsCount is 50 or more -->
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 50 items on Sprout Island" placement="bottom">
              <div class="badge-box">
                <img v-if="belongingsCount >= 50" src="/src/badges/sprout2.png" alt="Tree Badge" />
              </div>
            </el-tooltip>
            <p>Sprout LV2</p>
          </div>

          <!-- LV3 Badge: Display if belongingsCount is 100 or more -->
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 100 items on Sprout Island" placement="bottom">
              <div class="badge-box">
                <img v-if="belongingsCount >= 100" src="/src/badges/sprout3.png" alt="Forest Badge" />
              </div>
            </el-tooltip>
            <p>Sprout LV3</p>
          </div>
        </div>
      </div>

      <!-- Timer Badges -->
      <div class="badge-category">
        <h2>Timer Badges</h2>
        <div class="badge-items">
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Complete 10 hours of focused time successfully" placement="bottom">
              <div class="badge-box">
                <img v-if="totalDuration >= 10.0" src="/src/badges/timer1.png" alt="Timer Badge 1" />
              </div>
            </el-tooltip>
            <p>Timer LV1</p>
          </div>
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Complete 100 hours of focused time successfully" placement="bottom">
              <div class="badge-box">
                <img v-if="totalDuration >= 0.0" src="/src/badges/timer2.png" alt="Timer Badge 2" />
              </div>
            </el-tooltip>
            <p>Timer LV2</p>
          </div>
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Complete 200 hours of focused time successfully" placement="bottom">
              <div class="badge-box">
                <img v-if="totalDuration >= 0.0" src="/src/badges/timer3.png" alt="Timer Badge 3" />
              </div>
            </el-tooltip>
            <p>Timer LV3</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行: Task 和 Schedule -->
    <div class="badge-row">
      <!-- Task Badges -->
      <div class="badge-category">
        <h2>Task Badges</h2>
        <div class="badge-items">
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Complete 5 tasks successfully" placement="bottom">
              <div class="badge-box">
                <img v-if="successfulCount >= 5" src="/src/badges/task1.png" alt="Task Badge 1" />
              </div>
            </el-tooltip>
            <p>Task LV1</p>
          </div>
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Complete 50 tasks successfully" placement="bottom">
              <div class="badge-box">
                <img v-if="successfulCount >= 0" src="/src/badges/task2.png" alt="Task Badge 2" />
              </div>
            </el-tooltip>
            <p>Task LV2</p>
          </div>
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Complete 100 tasks successfully" placement="bottom">
              <div class="badge-box">
                <img v-if="successfulCount >= 0" src="/src/badges/task3.png" alt="Task Badge 3" />
              </div>
            </el-tooltip>
            <p>Task LV3</p>
          </div>
        </div>
      </div>

      <!-- Schedule Badges -->
      <div class="badge-category">
        <h2>Schedule Badges</h2>
        <div class="badge-items">
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 5 scheduled events set up" placement="bottom">
              <div class="badge-box">
                <img v-if="scheduleCount >= 0" src="/src/badges/schedule1.png" alt="Schedule Badge 1" />
              </div>
            </el-tooltip>
            <p>Schedule LV1</p>
          </div>
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 50 scheduled events set up" placement="bottom">
              <div class="badge-box">
                <img v-if="scheduleCount >= 0" src="/src/badges/schedule2.png" alt="Schedule Badge 2" />
              </div>
            </el-tooltip>
            <p>Schedule LV2</p>
          </div>
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 100 scheduled events set up" placement="bottom">
              <div class="badge-box">
                <img v-if="scheduleCount >= 0" src="/src/badges/schedule3.png" alt="Schedule Badge 3" />
              </div>
            </el-tooltip>
            <p>Schedule LV3</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const userId = ref(localStorage.getItem('userId') || '');
const belongingsCount = ref(0);
const successfulCount = ref(0);
const totalDuration = ref(0);
const scheduleCount = ref(0);


// Fetch belongings count from the backend
onMounted(async () => {
  try {
    const response = await axios.get(`http://localhost:8080/userBelongings/users/${userId.value}/count`);
    belongingsCount.value = response.data;
    console.log("Fetched belongingsCount:", belongingsCount.value)
  } catch (error) {
    console.error('Error fetching belongings count:', error);
  }

  // Fetch successful count
  try {
    const resSuccessful = await axios.get(`http://localhost:8080/focusTimer/users/${userId.value}/successfulCount`);
    successfulCount.value = resSuccessful.data;
    console.log("Fetched successfulCount:", successfulCount.value);
  } catch (error) {
    console.error('Error fetching successful count:', error);
  }

  // Fetch total duration
  try {
    const resDuration = await axios.get(`http://localhost:8080/focusTimer/users/${userId.value}/durationCount`);

    totalDuration.value = (parseFloat(resDuration.data) / 3600).toFixed(1);
    console.log("Fetched totalDuration:", totalDuration.value);
  } catch (error) {
    console.error('Error fetching total duration:', error);
  }

  // Fetch total schedule
  try {
    const resScheduleCount = await axios.get(`http://localhost:8080/schedule/users/${userId.value}/scheduleCount`);
    scheduleCount.value = resScheduleCount.data;  // 获取用户的日程数量
    console.log("Fetched scheduleCount:", scheduleCount.value);
  } catch (error) {
    console.error('Error fetching schedule count:', error);
  }

});



</script>


<style scoped>
.badges-container {
  background: #F9FBF7;
  display: flex; /* 使用 Flexbox 来布局容器 */
  flex-direction: column; /* 设置主轴方向为垂直，所有子元素按列排列 */
  gap: 10px; /* 设置子元素之间的间距 */
  align-items: center; /* 水平居中对齐子元素 */
  width: 100%; /* 设置容器的宽度为100% */
  height: 85vh;
  padding-top: 75px; /* 设置顶部间距 */
}

.badge-row {
  display: flex; /* 使用 Flexbox 来布局每一行 */
  justify-content: space-around; /* 在一行中均匀分布徽章 */
  width: 90%; /* 设置每一行的宽度为90% */
}

.badge-category {
  width: 45%; /* 设置每一类徽章的宽度为45%，占用容器的部分宽度 */
}

h2 {
  text-align: center; /* 将标题居中对齐 */
  font-size: 24px; /* 设置标题字体大小 */
  color: #4e6b50; /* 设置标题颜色 */
  margin-bottom: 35px; /* 设置标题下方的间距 */
}

.badge-items {
  display: flex; /* 使用 Flexbox 来布局徽章项 */
  justify-content: space-around; /* 在一行中均匀分布徽章项 */
  gap: 20px; /* 设置徽章项之间的间距 */
  margin-bottom: 20px; /* 设置徽章项下方的间距 */
}

.badge-item {
  width: 130px; /* 设置每个徽章项的宽度 */
  text-align: center; /* 将徽章项中的文本居中对齐 */
  margin-bottom: 10px; /* 设置每个徽章项下方的间距 */
}

.badge-box {
  width: 130px; /* 设置徽章框的宽度 */
  height: 130px; /* 设置徽章框的高度 */
  border-radius: 10px; /* 设置圆角 */
  overflow: hidden; /* 隐藏溢出的内容 */
  display: flex; /* 使用 Flexbox 布局，确保图片居中 */
  justify-content: center; /* 水平居中图片 */
  align-items: center; /* 垂直居中图片 */
  background-color: white; /* 设置徽章框的背景颜色 #e9f1e1*/
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.badge-box img {
  max-width: 70%; /* 设置图片的最大宽度为徽章框的70% */
  max-height: 70%; /* 设置图片的最大高度为徽章框的70% */
}

.badge-item p {
  margin-top: 10px; /* 设置文本与图片之间的间距 */
  font-size: 18px; /* 设置文本字体大小 */
  color: #4e6b50; /* 设置文本颜色 */
  justify-content: center;
}

</style>





