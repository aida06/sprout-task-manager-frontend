<template>
  <div class="calendar-container">
    <!-- Vue Cal 日历 -->
    <vue-cal
        :events="events"
        :time-from="0 * 60"
        :time-to="24 * 60"
        default-view="week"
        style="height: 800px; z-index: 1;"
        @event-click="openUpdateModal"
    />

    <!-- 新建日程按钮 -->
    <el-button type="primary" class="add-schedule-btn" @click="showCreateModal = true">
      New Schedule Reminder
    </el-button>

    <!-- 调度创建弹窗 -->
    <el-dialog v-model="showCreateModal" title="Create Reminder">
      <el-form label-width="120px">
        <el-form-item label="Title:">
          <el-input v-model="newSchedule.title" placeholder="Enter title..." />
        </el-form-item>

        <el-form-item label="Reminder Time:">
          <el-date-picker
              v-model="newSchedule.startTime"
              type="datetime"
              placeholder="Select date and time"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="Duration (minutes):">
          <el-input-number v-model="newSchedule.duration" :min="1" :step="1" />
        </el-form-item>

        <el-form-item label="Remind Before:">
          <el-select v-model="newSchedule.remindBefore" placeholder="Select">
            <el-option label="No Reminder" :value="0" />
            <el-option label="5 Minutes Before" :value="5" />
            <el-option label="10 Minutes Before" :value="10" />
            <el-option label="15 Minutes Before" :value="15" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="createScheduleEvent">Save</el-button>
      </template>
    </el-dialog>

    <!-- 更新日程弹窗 -->
    <el-dialog v-model="showUpdateModal" title="Update Reminder">
      <el-form label-width="120px">
        <el-form-item label="Title:">
          <el-input v-model="selectedSchedule.title" />
        </el-form-item>

        <el-form-item label="Reminder Time:">
          <el-date-picker
              v-model="selectedSchedule.startTime"
              type="datetime"
              placeholder="Select date and time"
              format="YYYY/MM/DD HH:mm"
              value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item label="Duration (minutes):">
          <el-input-number v-model="selectedSchedule.duration" :min="1" :step="1" />
        </el-form-item>

        <el-form-item label="Remind Before:">
          <el-select v-model="selectedSchedule.remindBefore">
            <el-option label="No Reminder" :value="0" />
            <el-option label="5 Minutes Before" :value="5" />
            <el-option label="10 Minutes Before" :value="10" />
            <el-option label="15 Minutes Before" :value="15" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="primary" @click="updateScheduleEvent">Update</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import { ref, onMounted } from "vue";
import "vue-cal/dist/vuecal.css";
import VueCal from "vue-cal";
import axios from "axios";
import { ElMessage } from "element-plus";
const userId = ref(localStorage.getItem("userId"));
const events = ref([]); // 日历事件
const schedules = ref([]); // 提醒事项列表
const showScheduleModal = ref(false); // 控制弹窗
const showCreateModal = ref(false);
const showUpdateModal = ref(false);
const selectedSchedule = ref({});



const newSchedule = ref({
  title: "",
  startTime: "",
  duration: 30, // 默认 30 分钟
  remindBefore: 0, // 默认不提前提醒
});

// 1) 小工具：格式化本地日期 -> "YYYY-MM-DD HH:mm"
function formatLocalDateTime(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
}

// 2) 拉取后端 schedules
const fetchSchedules = async () => {
  try {
    const res = await axios.get("http://localhost:8080/schedule");
    const data = res.data; // 假设其中 startTime 是 "2025-03-19T07:57:41Z"

    events.value = data.map(sch => {
      const start = new Date(sch.startTime); // 解析 UTC
      const end = new Date(start.getTime() + sch.duration * 1000);

      return {
        start: formatLocalDateTime(start),
        end: formatLocalDateTime(end),
        title: sch.title
      };
    });
  } catch (err) {
    console.error("Failed to fetch schedules:", err);
  }
};

// **组件挂载时加载日程**
onMounted(() => {
  fetchSchedules();
});



const createScheduleEvent = async () => {
  console.log("New Schedule:", newSchedule.value);

  // 如果用户未填写 startTime，就给个默认当前时间
  const scheduleTime = newSchedule.value.startTime
      ? newSchedule.value.startTime
      : new Date().toISOString().slice(0, 16).replace("T", " ");

  // 假设用户输入的格式为 "YYYY-MM-DD HH:mm:ss" 或 "YYYY-MM-DD HH:mm"
  // 1. 拆分出日期与时间
  const [datePart, timePart] = scheduleTime.split(" ");
  // 例如 datePart = "2025-03-19", timePart = "09:35:30"

  // 2. 拆分日期与时间
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute, second = 0] = timePart.split(":").map(Number);

  // 3. 构造“本地” Date 对象（带本地时区信息）
  const localDate = new Date(year, month - 1, day, hour, minute, second);

  // 4. 转成带毫秒的标准 ISO 字符串 (e.g. "2025-03-19T01:35:30.000Z")
  let fullIso = localDate.toISOString();

  // 5. 去掉毫秒部分，“.000”，只保留到秒，并拼回 "Z"
  //    "2025-03-19T01:35:30.000Z" -> "2025-03-19T01:35:30Z"
  let isoNoMillis = fullIso.slice(0, 19) + "Z";

  // 最终发送给后端的 UTC 时间 (不含毫秒)
  const utcString = isoNoMillis;

  const scheduleItem = {
    title: newSchedule.value.title,
    startTime: utcString,  // e.g. "2025-03-19T01:35:30Z"
    duration: newSchedule.value.duration * 60,
    remindBefore: newSchedule.value.remindBefore,
    userId: userId.value
  };

  console.log("Sending to backend:", scheduleItem);

  try {
    await axios.post("http://localhost:8080/schedule/createReminder", scheduleItem);
    ElMessage.success("Schedule saved successfully!");
    await fetchSchedules();
  } catch (error) {
    console.error("Failed to save schedule:", error);
    ElMessage.error("Failed to save schedule.");
  }

  // 重置表单 & 关闭弹窗
  closeModal();
};

// 打开更新弹窗
const openUpdateModal = (event) => {
  selectedSchedule.value = {
    id: event.id,
    title: event.title,
    startTime: formatLocalDateTime(new Date(event.start)),
    duration: event.duration,
    remindBefore: event.remindBefore,
  };
  showUpdateModal.value = true;
};

// 更新日程
const updateScheduleEvent = async () => {
  try {
    await axios.put(`http://localhost:8080/schedule/updateReminder`, {
      scheduleId: selectedSchedule.value.scheduleId,
      title: selectedSchedule.value.title,
      startTime: new Date(selectedSchedule.value.startTime).toISOString(),
      duration: selectedSchedule.value.duration * 60,
      remindBefore: selectedSchedule.value.remindBefore,
    });
    ElMessage.success("Schedule updated successfully!");
    fetchSchedules();
    showUpdateModal.value = false;
  } catch (error) {
    console.error("Failed to update schedule:", error);
    ElMessage.error("Failed to update schedule.");
  }
};

// 关闭弹窗
const closeModal = () => {
  showScheduleModal.value = false;
  newSchedule.value = { title: "", startTime: "", duration: 30, reminderBefore: 0 };
};


</script>




<style scoped>
/* 日历容器 */
.calendar-container {
  max-width: 1000px;
  margin: auto;
  position: relative;
}

/* 添加日程按钮 */
.add-schedule-btn {
  position: absolute;
  top: 10px;
  right: 20px;
  z-index: 1000;
}

/* 鼠标悬停时变手型 */
:deep(.vuecal__event) {
  cursor: pointer;
}

:deep(.el-form-item) {
  display: flex;
  align-items: center;
  gap: 15px; /* 控制间距 */
}

:deep(.el-input),
:deep(.el-date-picker),
:deep(.el-select),
:deep(.el-input-number) {
  width: 100%;
}
</style>






