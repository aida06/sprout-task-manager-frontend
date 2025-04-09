<template>
  <div class="dashboard-container" ref="dashboardContainer">
    <!-- ===== 导出按钮和下拉菜单 ===== -->
    <div class="export-wrapper">
      <button @click="toggleExportMenu">Export</button>
      <div v-if="showExportMenu" class="export-menu">
        <button @click="exportAsPDF">PDF</button>
        <button @click="exportAsImage('png')">PNG</button>
        <button @click="exportAsImage('jpg')">JPG</button>
      </div>
    </div>

    <!-- 时间维度切换按钮 -->
    <div class="filter-buttons">
      <button
          v-for="option in timeOptions"
          :key="option"
          @click="selectedTime = option"
          :class="{ active: selectedTime === option }"
      >
        {{ option }}
      </button>
    </div>

    <!-- 翻页按钮和当前日期显示 -->
    <div class="navigation-buttons">
      <button @click="changeDate(-1)">←</button>
      <span class="current-date">{{ displayDate }}</span>
      <button @click="changeDate(1)">→</button>
    </div>

    <!-- 已完成 / 未完成 统计 -->
    <div class="completion-stats">
      <span>Completed: {{ completedCount }} </span>
      &nbsp;&nbsp;
      <span>Not Completed: {{ notCompletedCount }}</span>
    </div>

    <!-- 第一行图表：左-专注时间柱状图；右-完成率折线图 -->
    <div class="charts-row">
      <div class="chart-container" ref="focusTimeChart"></div>
      <div class="chart-container" ref="completionRateChart"></div>
    </div>

    <!-- 第二行：第三个饼图（只统计“成功”任务的时长占比） -->
    <div class="pie-row">
      <div class="chart-container" ref="taskPieChart"></div>
    </div>

    <div class="text-report-section" ref="reportLogBlock">
      <h3 style="font-size: 20px; color: #444;">Detailed Data Record</h3>

      <pre>{{ reportLog }}</pre>
    </div>


  </div>
</template>

<script>
import { ref, onMounted, watch, computed } from "vue";
import * as echarts from "echarts";
import axios from "axios";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

dayjs.extend(weekOfYear);

export default {
  setup() {


    // ==============================
    // 1) 基础数据与引用
    // ==============================
    const selectedTime = ref("Day");
    const dashboardContainer = ref(null);  // 用于捕捉整个页面或主要区域
    const showExportMenu = ref(false);     // 控制下拉菜单显隐


    const focusTimeChart = ref(null);       // 柱状图
    const completionRateChart = ref(null);  // 折线图
    const taskPieChart = ref(null);         // 饼图

    let chartInstanceFocus = null;
    let chartInstanceCompletion = null;
    let chartInstancePie = null;

    const timeOptions = ["Day", "Week", "Month", "Year"];
    const currentDate = ref(dayjs());

    const reportLog = ref("")
    const reportLogBlock = ref(null);

    // ==============================
    // 2) 日期显示与切换
    // ==============================
    const displayDate = computed(() => {
      if (selectedTime.value === "Day") {
        return currentDate.value.format("YYYY-MM-DD");
      } else if (selectedTime.value === "Week") {
        const startOfWeek = currentDate.value.startOf("week");
        const endOfWeek = currentDate.value.endOf("week");
        return `${startOfWeek.format("YYYY-MM-DD")} ~ ${endOfWeek.format("YYYY-MM-DD")}`;
      }
      else if (selectedTime.value === "Month") {
        return currentDate.value.format("MMMM YYYY");
      } else if (selectedTime.value === "Year") {
        return currentDate.value.format("YYYY");
      }
      return "";
    });

    const changeDate = (step) => {
      if (selectedTime.value === "Day") {
        currentDate.value = currentDate.value.add(step, "day");
      } else if (selectedTime.value === "Week") {
        currentDate.value = currentDate.value.add(step, "week");
      } else if (selectedTime.value === "Month") {
        currentDate.value = currentDate.value.add(step, "month");
      } else if (selectedTime.value === "Year") {
        currentDate.value = currentDate.value.add(step, "year");
      }
    };

    // ==============================
    // 3) 获取后端数据
    // ==============================
    const fetchFocusTimeData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/focusTimer");
        return res.data;
      } catch (error) {
        console.error("Get timer data failed:", error);
        return [];
      }
    };

    // ==============================
    // 4) 已完成 / 未完成统计
    // ==============================
    const completedCount = ref(0);
    const notCompletedCount = ref(0);

    // 判断条目是否在当前所选范围
    const inCurrentRange = (entryDate) => {
      if (selectedTime.value === "Day") {
        return entryDate.isSame(currentDate.value, "day");
      } else if (selectedTime.value === "Week") {
        return entryDate.isSame(currentDate.value, "week");
      } else if (selectedTime.value === "Month") {
        return entryDate.isSame(currentDate.value, "month");
      } else if (selectedTime.value === "Year") {
        return entryDate.isSame(currentDate.value, "year");
      }
      return false;
    };

    // ==============================
    // 5) 更新图表主逻辑
    // ==============================
    const updateChart = async () => {
      const rawData = await fetchFocusTimeData();

      // (A) 聚合专注时间的柱状图 —— 仅统计成功的
      const focusFiltered = rawData.filter((entry) => entry.successful === true);
      let focusLabels = [];
      let focusData = [];

      if (selectedTime.value === "Day") {
        focusLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        focusData = new Array(24).fill(0);

        focusFiltered.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "day")) {
            const hour = entryDate.hour();
            focusData[hour] += entry.duration / 60; // 秒转分钟
          }
        });
      } else if (selectedTime.value === "Week") {
        // **Week 视图 - Sunday 开头**
        focusLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        focusData = new Array(7).fill(0);

        focusFiltered.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "week")) {
            const d = entryDate.day(); // dayjs().day() 返回 0=Sunday, ..., 6=Saturday
            focusData[d] += entry.duration / 60; // 直接用 d 作为索引
          }
        });
      } else if (selectedTime.value === "Month") {
        const daysInMonth = currentDate.value.daysInMonth();
        focusLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        focusData = new Array(daysInMonth).fill(0);

        focusFiltered.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "month")) {
            const day = entryDate.date();
            focusData[day - 1] += entry.duration / 60;
          }
        });
      } else if (selectedTime.value === "Year") {
        focusLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        focusData = new Array(12).fill(0);

        focusFiltered.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "year")) {
            const m = entryDate.month();
            focusData[m] += entry.duration / 60;
          }
        });
      }

      // (B) 完成率折线图 —— (成功数 / 总数)*100
      let completionLabels = [];
      let completionData = [];
      let totalArr = [];
      let doneArr = [];

      if (selectedTime.value === "Day") {
        completionLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        totalArr = new Array(24).fill(0);
        doneArr = new Array(24).fill(0);

        rawData.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "day")) {
            const hour = entryDate.hour();
            totalArr[hour] += 1;
            if (entry.successful === true) {
              doneArr[hour] += 1;
            }
          }
        });

        completionData = totalArr.map((count, i) => (count === 0 ? 0 : (doneArr[i] / count) * 100));
      }else if (selectedTime.value === "Week") {
        // **Week 视图 - Sunday 开头**
        completionLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        totalArr = new Array(7).fill(0);
        doneArr = new Array(7).fill(0);

        rawData.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "week")) {
            const d = entryDate.day(); // dayjs().day() 返回 0=Sunday, ..., 6=Saturday
            totalArr[d] += 1;
            if (entry.successful === true) {
              doneArr[d] += 1;
            }
          }
        });

        completionData = totalArr.map((count, i) => (count === 0 ? 0 : (doneArr[i] / count) * 100));
      } else if (selectedTime.value === "Month") {
        const daysInMonth = currentDate.value.daysInMonth();
        completionLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
        totalArr = new Array(daysInMonth).fill(0);
        doneArr = new Array(daysInMonth).fill(0);

        rawData.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "month")) {
            const day = entryDate.date();
            totalArr[day - 1] += 1;
            if (entry.successful === true) {
              doneArr[day - 1] += 1;
            }
          }
        });

        completionData = totalArr.map((count, i) => (count === 0 ? 0 : (doneArr[i] / count) * 100));
      } else if (selectedTime.value === "Year") {
        completionLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        totalArr = new Array(12).fill(0);
        doneArr = new Array(12).fill(0);

        rawData.forEach((entry) => {
          const entryDate = dayjs(entry.startTime);
          if (entryDate.isSame(currentDate.value, "year")) {
            const m = entryDate.month();
            totalArr[m] += 1;
            if (entry.successful === true) {
              doneArr[m] += 1;
            }
          }
        });

        completionData = totalArr.map((count, i) => (count === 0 ? 0 : (doneArr[i] / count) * 100));
      }

      // (C) 汇总：Completed / Not Completed
      let totalInRange = 0;
      let doneInRange = 0;
      rawData.forEach((entry) => {
        const entryDate = dayjs(entry.startTime);
        if (inCurrentRange(entryDate)) {
          totalInRange++;
          if (entry.successful === true) doneInRange++;
        }
      });
      completedCount.value = doneInRange;
      notCompletedCount.value = totalInRange - doneInRange;

      // (D) 第三个饼图：只统计成功的任务时长占比
      // 这里改用 focusFiltered（已经是 successful === true）那部分
      const taskDurationMap = {}; // { 'Study': 60, 'play2': 30, ... } （单位：分钟）
      focusFiltered.forEach((entry) => {
        const entryDate = dayjs(entry.startTime);
        if (inCurrentRange(entryDate)) {
          const taskKey = entry.taskName || "Unknown Task";
          if (!taskDurationMap[taskKey]) {
            taskDurationMap[taskKey] = 0;
          }
          // 累加本条记录的时长(秒 => 分钟)
          taskDurationMap[taskKey] += entry.duration / 60;
        }
      });
      const pieData = Object.entries(taskDurationMap).map(([taskName, totalMinutes]) => {
        return { name: taskName, value: totalMinutes };
      });

      // 销毁旧图表实例
      if (chartInstanceFocus) chartInstanceFocus.dispose();
      if (chartInstanceCompletion) chartInstanceCompletion.dispose();
      if (chartInstancePie) chartInstancePie.dispose();

      // --- Focus Time 柱状图 ---
      chartInstanceFocus = echarts.init(focusTimeChart.value);
      chartInstanceFocus.setOption({
        title: { text: "Focus Time (min)", left: "center" },
        xAxis: { type: "category", data: focusLabels },
        yAxis: { type: "value", name: "Minutes" },
        series: [
          {
            type: "bar",
            data: focusData,
            itemStyle: { color: "#4B9CD3" },
          },
        ],
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      });

      // --- Task Completion Rate 折线图 ---
      chartInstanceCompletion = echarts.init(completionRateChart.value);
      chartInstanceCompletion.setOption({
        title: { text: "Task Completion Rate (%)", left: "center" },
        xAxis: { type: "category", data: completionLabels },
        yAxis: { type: "value", name: "Completion %", min: 0, max: 100 },
        series: [
          {
            type: "line",
            data: completionData,
            smooth: true,
            lineStyle: { color: "#F5A623", width: 3 },
            itemStyle: { color: "#F5A623" },
          },
        ],
        tooltip: {
          trigger: "axis",
          formatter: (params) => {
            const val = params[0].value;
            return `Completion Rate: ${val.toFixed(1)}%`;
          },
        },
      });

      // --- 第三个饼图（只包含成功任务） ---
      chartInstancePie = echarts.init(taskPieChart.value);
      chartInstancePie.setOption({
        title: {
          text: "Task Duration Distribution",
          left: "center",
          top: "5px"  // 让标题更靠近饼图
        },
        tooltip: {
          trigger: "item",
          formatter: "{b}: {c} min ({d}%)"
        },
        legend: {
          orient: "vertical",
          left: "7%",
          top: "20px", // 让图例更靠近饼图
        },
        series: [
          {
            name: "Task Duration",
            type: "pie",
            radius: "50%",
            center: ["50%", "48%"], // 适当向上移动饼图
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      });

      // 生成简单文字描述
      // let summaryText = `Detailed Data Records\n\n`
      let summaryText = `Selected Time: ${displayDate.value}\n`
      summaryText += `Number of Completed Tasks: ${completedCount.value}\n`
      summaryText += `Number of Not Completed Tasks: ${notCompletedCount.value}\n\n`

      // 比如，把专注时长分布也描述下
      summaryText += `Focus Time Distribution (Bar Chart):\n`
      focusLabels.forEach((label, i) => {
        // focusData[i] 是对应时段的分钟数
        summaryText += ` - ${label}: ${focusData[i].toFixed(1)} min\n`
      })

      // 完成率折线图
      summaryText += `\nCompletion Rate (Line Chart):\n`
      completionLabels.forEach((label, i) => {
        summaryText += ` - ${label}: ${completionData[i].toFixed(1)}%\n`
      })

      // 饼图
      summaryText += `\nTask Duration Distribution (Pie Chart):\n`
      pieData.forEach(item => {
        summaryText += ` - ${item.name}: ${item.value.toFixed(1)} min\n`
      })

      // 存入全局 reportLog
      reportLog.value = summaryText

    };

    // ==============================
    // 6) 监听时间与日期变化，立即更新图表
    // ==============================
    watch([selectedTime, currentDate], updateChart, { immediate: true });
    onMounted(updateChart);

    // =============== 1) 控制下拉菜单展示/隐藏 ===============
    const toggleExportMenu = () => {
      showExportMenu.value = !showExportMenu.value;
    };

    // =============== 2) 导出 PDF ===============
    // const exportAsPDF = async () => {
    //   showExportMenu.value = false; // 关闭菜单
    //
    //   // 选取要导出的 DOM 元素（可只导出图表部分，也可导出整个 .dashboard-container）
    //   const element = dashboardContainer.value;
    //
    //   // 将其转换成 canvas
    //   const canvas = await html2canvas(element, {
    //     // 可以根据需要配置
    //     scale: 2, // 提高分辨率
    //   });
    //   const imgData = canvas.toDataURL("image/png");
    //
    //   // 用 jsPDF 把图像塞进 PDF
    //   const pdf = new jsPDF("p", "pt", "a4");
    //   // 计算页面宽高 & 图片宽高
    //   const pageWidth = pdf.internal.pageSize.getWidth();
    //   const pageHeight = pdf.internal.pageSize.getHeight();
    //   const imgWidth = canvas.width;
    //   const imgHeight = canvas.height;
    //
    //   // 让图片适应 A4 大小
    //   const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    //   const displayWidth = imgWidth * ratio;
    //   const displayHeight = imgHeight * ratio;
    //
    //   // 绘制到 PDF
    //   pdf.addImage(imgData, "PNG", 0, 0, displayWidth, displayHeight);
    //   pdf.save("dashboard.pdf");
    // };

    const exportAsPDF = async () => {
      showExportMenu.value = false;
      const element = dashboardContainer.value;
      const reportLogBlockEl = reportLogBlock.value;

      // 1. 临时隐藏 reportLog 区域
      const originalDisplay = reportLogBlockEl.style.display;
      reportLogBlockEl.style.display = "none";

      // 2. 截图
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");

      // 3. 还原 display
      reportLogBlockEl.style.display = originalDisplay;

      // 4. 开始生成 PDF
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      const displayWidth = imgWidth * ratio;
      const displayHeight = imgHeight * ratio;

      pdf.addImage(imgData, "PNG", 0, 0, displayWidth, displayHeight);

      // 5. 添加纯净文字版报告
      let textY = displayHeight + 20;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
      const lines = pdf.splitTextToSize(reportLog.value, pageWidth - 40);
      const lineHeight = 14;

      lines.forEach((line) => {
        if (textY > pageHeight - 20) {
          pdf.addPage();
          textY = 40;
        }
        pdf.text(line, 20, textY);
        textY += lineHeight;
      });

      pdf.save("dashboard_report.pdf");
    };

    // 通用导出图片方法
    const exportAsImage = async (format) => {
      showExportMenu.value = false
      const element = dashboardContainer.value

      const canvas = await html2canvas(element, { scale: 2 })

      // 获取导出的 DataURL
      const quality = format === 'jpeg' ? 0.9 : 1.0
      const imgData = canvas.toDataURL(`image/${format}`, quality)

      const link = document.createElement("a")
      link.href = imgData
      link.download = `dashboard.${format}`
      link.click()
    }


    return {
      dashboardContainer,
      selectedTime,
      timeOptions,
      focusTimeChart,
      completionRateChart,
      taskPieChart,
      displayDate,
      changeDate,
      completedCount,
      notCompletedCount,
      // 新增返回
      showExportMenu,
      toggleExportMenu,
      exportAsPDF,
      exportAsImage,
      reportLog,
      reportLogBlock,
    };
  },


};
</script>

<style scoped>
.dashboard-container {
  margin-top: 25px;
  text-align: center;
  position: relative;
}

.text-report-section pre {
  font-family: "Helvetica", "Arial", sans-serif;
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap; /* 自动换行 */
  word-break: break-word; /* 避免长字符串撑爆 */
  color: #333; /* 字体颜色柔一点 */
}

/* ====== 导出按钮样式优化 ====== */
.export-wrapper {
  position: absolute;
  top: 0;
  left: 0;
}

/* 按钮基础样式 */
button {
  background: #DCEDC8;
  color: #689F38;
  border: none;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

/* 悬浮（hover）效果 */
button:hover {
  background: #C5E1A5;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-1px);
}

/* 点击（active）效果 */
button:active {
  transform: scale(0.95);
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

/* 导出菜单 */
.export-menu {
  background-color: #fff;
  border: 1.5px solid #ECEFF1;
  border-radius: 6px;
  margin-top: 5px;
  padding: 5px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}

.export-menu button {
  background: #FFFFFF;
  border: 1.5px solid #F5F5F5;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  font-size: 14px;
  border-radius: 4px;
}

/* 悬浮菜单项 */
.export-menu button:hover {
  background: #F5F5F5;
  transform: translateX(3px);
}


.filter-buttons button {
  margin: 5px 6px; /* 上下 5px，左右 8px */
  padding: 10px 16px;
}

.navigation-buttons {
  margin: 5px 8px;
  align-items: center;  /* 让按钮和日期居中对齐 */
  gap: 20px;  /* 设置按钮和日期之间的间距 */
}

.completion-stats {
  margin: 10px 0;
}

.charts-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.pie-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.chart-container {
  width: 43%;
  height: 370px;
  min-width: 300px;
}



</style>







