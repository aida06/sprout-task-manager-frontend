<template>
  <div class="dashboard-container">

    <!-- 时间切换按钮 -->
    <div class="filter-buttons">
      <button v-for="option in timeOptions" :key="option"
              @click="selectedTime = option"
              :class="{ active: selectedTime === option }">
        {{ option }}
      </button>
    </div>

    <!-- Focus Time 柱状图 -->
    <div class="chart-container">
      <canvas ref="focusTimeChart"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from "vue";
import Chart from "chart.js/auto";
import axios from "axios";

export default {
  setup() {
    const selectedTime = ref("Day"); // 默认显示 "Day"
    const focusTimeChart = ref(null);
    let chartInstance = null;

    const timeOptions = ["Day", "Week", "Month", "Year"];

    // 模拟后端数据
    const fetchFocusTimeData = async () => {
      try {
        const response = await axios.get("http://localhost:8080/focusTimer");
        return response.data; // 假设返回 { date: "2025-03-06", duration: 1800 } 这样的数据

      } catch (error) {
        console.error("Get timer data failed:", error);
        return [];
      }
    };

    const updateChart = async () => {
      const rawData = await fetchFocusTimeData();

      let labels = [];
      let data = [];

      if (selectedTime.value === "Day") {
        labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        data = new Array(24).fill(0);

        rawData.forEach((entry) => {
          let hour = new Date(entry.startTime).getHours();
          console.log(`Task: ${entry.taskName}, UTC Time: ${entry.startTime}, Local hour: ${hour}`);
          data[hour] += entry.duration / 60;
        });

        // console.log("Day 模式下的数据:", data);

      } else if (selectedTime.value === "Week") {
        labels = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        data = new Array(7).fill(0);

        rawData.forEach((entry) => {
          let localDate = new Date(entry.startTime);
          let day = localDate.getDay();
          console.log(`Task: ${entry.taskName}, UTC Time: ${entry.startTime}, 解析的星期: ${day}, 转换索引: ${day === 0 ? 6 : day - 1}`);
          data[day === 0 ? 6 : day - 1] += entry.duration / 60;
        });

        // console.log("Week 模式下的数据:", data);

      } else if (selectedTime.value === "Month") {
        let daysInMonth = new Date(2025, 3, 0).getDate();
        labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        data = new Array(daysInMonth).fill(0);

        rawData.forEach((entry) => {
          let day = new Date(entry.startTime).getDate();
          console.log(`Task: ${entry.taskName}, UTC Time: ${entry.startTime}, 解析的日期: ${day}`);
          data[day - 1] += entry.duration / 60;
        });

        // console.log("Month 模式下的数据:", data);

      } else if (selectedTime.value === "Year") {
        labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        data = new Array(12).fill(0);

        rawData.forEach((entry) => {
          let month = new Date(entry.startTime).getMonth();
          console.log(`Task: ${entry.taskName}, UTC Time: ${entry.startTime}, 解析的月份索引: ${month}`);
          data[month] += entry.duration / 60;
        });

        // console.log("Year 模式下的数据:", data);
      }




    // 销毁旧的图表
      if (chartInstance) {
        chartInstance.destroy();
      }

      // 创建新的柱状图
      chartInstance = new Chart(focusTimeChart.value, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Focus Time (min)",
              data: data,
              backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: { beginAtZero: true },
          },
        },
      });
    };

    onMounted(updateChart);
    watch(selectedTime, updateChart);

    return {
      selectedTime,
      timeOptions,
      focusTimeChart,
    };
  },
};
</script>

<style scoped>
.dashboard-container {
  text-align: center;
  margin-top: 20px;
}

.filter-buttons {
  margin-bottom: 20px;
}

button {
  margin: 5px;
  padding: 8px 12px;
  border: none;
  cursor: pointer;
  background-color: #ccc;
}

button.active {
  background-color: #007bff;
  color: white;
}

.chart-container {
  width: 80%;
  margin: auto;
}
</style>

