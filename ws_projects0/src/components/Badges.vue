<template>
  <div class="badges-container">
    <div class="badge-row">
      <!-- Sprout Island Badges -->
      <div class="badge-category">
        <h2>Sprout Island Badges</h2>
        <div class="badge-items">
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 5 items on Sprout Island" placement="bottom">
              <div class="badge-box">
                <img v-if="belongingsCount >= 5" src="/src/badges/sprout1.png" alt="Sprout Badge" />
              </div>
            </el-tooltip>
            <p>Sprout LV1</p>
          </div>
          <div class="badge-item">
            <el-tooltip class="item" effect="dark" content="Have 50 items on Sprout Island" placement="bottom">
              <div class="badge-box">
                <img v-if="belongingsCount >= 50" src="/src/badges/sprout2.png" alt="Tree Badge" />
              </div>
            </el-tooltip>
            <p>Sprout LV2</p>
          </div>
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
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  width: 100%;
  height: 85vh;
  padding-top: 75px;
}

.badge-row {
  display: flex;
  justify-content: space-around;
  width: 90%;
}

.badge-category {
  width: 45%;
}

h2 {
  text-align: center;
  font-size: 24px;
  color: #4e6b50;
  margin-bottom: 35px;
}

.badge-items {
  display: flex;
  justify-content: space-around;
  gap: 20px;
  margin-bottom: 20px;
}

.badge-item {
  width: 130px;
  text-align: center;
  margin-bottom: 10px;
}

.badge-box {
  width: 130px;
  height: 130px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
}

.badge-box img {
  max-width: 70%;
  max-height: 70%;
}

.badge-item p {
  margin-top: 10px;
  font-size: 18px;
  color: #4e6b50;
  justify-content: center;
}

</style>





