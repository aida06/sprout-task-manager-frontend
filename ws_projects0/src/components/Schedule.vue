<template>
  <div class="calendar-container">
    <!-- Vue Cal 日历 -->
    <vue-cal
        :events="events"
        :time-from="0 * 60"
        :time-to="24 * 60"
        default-view="week"
        :available-views="['day', 'week', 'month', 'year']"
        style="height: 800px; z-index: 1;"
        @event-click="openUpdateModal"
    />

    <!-- 新建日程按钮 -->
    <el-button type="primary" class="add-schedule-btn" @click="showCreateModal = true">
      New Schedule
    </el-button>

    <!-- 调度创建弹窗 -->
    <el-dialog v-model="showCreateModal" title="Create Schedule">
      <el-form label-width="120px">
        <el-form-item label="Schedule Title:">
          <el-input v-model="newSchedule.title" placeholder="Enter title..." />
        </el-form-item>

        <el-form-item label="Schedule Time:">
          <el-date-picker
              v-model="newSchedule.startTime"
              type="datetime"
              placeholder="Select date and time"
              format="YYYY/MM/DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="Duration(mins):">
          <el-input-number v-model="newSchedule.duration" :min="1" :step="1" />
        </el-form-item>

        <el-form-item label="Remind Before:">
          <el-select
              v-model="newSchedule.remindBefore"
              placeholder="Select"
              :clearable="true"
              :value-key="'value'"
          >
            <el-option label="No Reminder" :value="'none'" />
            <el-option label="Remind Immediately" :value="0" />
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
    <el-dialog v-model="showUpdateModal" title="Update Schedule">
      <el-form label-width="120px">
        <el-form-item label="Schedule Title:">
          <el-input v-model="selectedSchedule.title" />
        </el-form-item>

        <el-form-item label="Schedule Time:">
          <el-date-picker
              v-model="selectedSchedule.startTime"
              type="datetime"
              placeholder="Select date and time"
              format="YYYY/MM/DD HH:mm"
          />
        </el-form-item>

        <el-form-item label="Duration(mins):">
          <el-input-number v-model="selectedSchedule.duration" :min="1" :step="1" />
        </el-form-item>

        <el-form-item label="Remind Before:">
          <el-select
              v-model="selectedSchedule.remindBefore"
              placeholder="Select"
              :clearable="true"
              :value-key="'value'"
          >
            <el-option label="No Reminder" :value="'none'" />
            <el-option label="Remind Immediately" :value="0" />
            <el-option label="5 Minutes Before" :value="5" />
            <el-option label="10 Minutes Before" :value="10" />
            <el-option label="15 Minutes Before" :value="15" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button type="danger" @click="deleteScheduleEvent">Delete</el-button>
        <el-button type="primary" @click="updateScheduleEvent">Update</el-button>
      </template>
    </el-dialog>
  </div>
</template>


<script setup>
import { ref, onMounted} from "vue";
import "vue-cal/dist/vuecal.css";
import VueCal from "vue-cal";
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";
const userId = ref(localStorage.getItem("userId"));
const events = ref([]); // 日历事件


const showScheduleModal = ref(false); // 控制弹窗
const showCreateModal = ref(false);
const showUpdateModal = ref(false);
const selectedSchedule = ref({});
let reminderTimers = []; // 存放计时器ID，避免重复


const newSchedule = ref({
  title: "",
  startTime: "",
  duration: 30, // 默认 30 分钟
  remindBefore: 'none', // 默认不提前提醒
});

const checkNotificationPermission = async () => {
  const permission = Notification.permission;
  console.log("🔍 Notification permission:", permission);

  if (permission === "granted") {
    // ✅ Permission already granted, no need to notify user
    return;
  } else if (permission === "default") {
    const result = await Notification.requestPermission();
    if (result === "granted") {
      ElMessage.success("Notification permission granted!");
    } else {
      ElMessage.warning("Notification denied. Reminders may not appear.");
    }
  } else {
    ElMessage.error("Notification permission is blocked. Please enable it in your browser settings.");
  }
};


function setupReminders() {
  reminderTimers.forEach(timerId => clearTimeout(timerId));
  reminderTimers = [];

  events.value.forEach(evt => {
    if (evt.remindBefore == null || evt.remindBefore < 0) return;

    const startTimeMs = evt.start.getTime();
    const remindMs = startTimeMs - evt.remindBefore * 60 * 1000;
    const now = Date.now();
    const diff = remindMs - now;

    if (diff > 0) {
      const timerId = setTimeout(() => {
        console.log("🔔 permission:", Notification.permission);

        if (Notification.permission === "granted") {
          new Notification("Reminder", {
            body: `It's time for "${evt.title}"!`,
            icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png",
          });
        } else {
          ElNotification({
            title: "Reminder",
            message: `It's time for "${evt.title}"!`,
            type: "info",
            duration: 0,
          });
        }
      }, diff);

      reminderTimers.push(timerId);
    }
  });
}




const fetchSchedules = async () => {
  try {
    const res = await axios.get("http://localhost:8080/schedule");
    const data = res.data;

    events.value = data.map(sch => {
      const start = new Date(sch.startTime); // 浏览器自动从 UTC → 本地时间
      const end = new Date(start.getTime() + sch.duration * 1000);

      // console.log("🔵 Payload:", {
      //   id: sch.scheduleId,
      //   start,
      //   end,
      //   title: sch.title,
      //   duration: sch.duration / 60,
      //   remindBefore: sch.remindBefore
      // });

      return {
        id: sch.scheduleId,
        start,
        end,
        title: sch.title,      // 方块内只显示标题
        duration: sch.duration / 60,
        remindBefore: sch.remindBefore,
        class: 'custom-event'
      };
    });
    // **在拉取完后，调用 setupReminders**：
    setupReminders();
  } catch (err) {
    console.error("Failed to fetch schedules:", err);
  }
};

// 组件挂载时加载日程
onMounted(() => {
  console.log('permission:', Notification.permission);

  checkNotificationPermission(); // 🟢 自动检测权限并请求

  fetchSchedules();
});


const createScheduleEvent = async () => {
  const { title, startTime, duration, remindBefore } = newSchedule.value;

  // 前置校验
  if (!title || !startTime || duration === null || remindBefore === undefined) {
    ElMessage.error("Please complete all required fields.");
    return;
  }

  const localDate = new Date(startTime);
  const utcString = localDate.toISOString();

  const scheduleItem = {
    title,
    startTime: utcString,
    duration: duration * 60,
    remindBefore: remindBefore === 'none' ? null : remindBefore,
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

  closeModal();
};


// 打开更新弹窗
const openUpdateModal = (event) => {
  selectedSchedule.value = {
    scheduleId: event.id,
    title: event.title,
    startTime: event.start,
    duration: event.duration,
    remindBefore: event.remindBefore === null ? 'none' : event.remindBefore, // ✅ 修正
  };
  showUpdateModal.value = true;
};


// 更新日程
const updateScheduleEvent = async () => {
  const { scheduleId, title, startTime, duration, remindBefore } = selectedSchedule.value;

  // 前置校验
  if (!scheduleId || !title || !startTime || duration === null || remindBefore === undefined) {
    ElMessage.error("Please complete all required fields.");
    return;
  }

  try {
    await axios.put("http://localhost:8080/schedule/updateReminder", {
      scheduleId,
      title,
      startTime: new Date(startTime).toISOString(),
      duration: duration * 60,
      remindBefore: remindBefore === 'none' ? null : remindBefore,
    });

    ElMessage.success("Schedule updated successfully!");
    fetchSchedules();
    showUpdateModal.value = false;
    // console.log("🔵 Payload:", {
    //   scheduleId,
    //   title,
    //   startTime: new Date(startTime).toISOString(),
    //   duration: duration * 60,
    //   remindBefore: remindBefore === 'none' ? null : remindBefore,
    // });
  } catch (error) {
    console.error("Failed to update schedule:", error);
    ElMessage.error("Failed to update schedule.");
    console.log("🔵 Payload:", {
      scheduleId,
      title,
      startTime: new Date(startTime).toISOString(),
      duration: duration * 60,
      remindBefore,
    });
  }
};

const deleteScheduleEvent = async () => {
  const { scheduleId } = selectedSchedule.value;

  if (!scheduleId) {
    ElMessage.warning("No schedule selected to delete.");
    return;
  }

  try {
    await axios.delete(`http://localhost:8080/schedule/deleteReminder/${scheduleId}`);
    ElMessage.success("Schedule deleted successfully!");
    fetchSchedules(); // 更新日程列表
    showUpdateModal.value = false; // 关闭弹窗
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    ElMessage.error("Failed to delete schedule.");
  }
};


// 关闭弹窗
const closeModal = () => {
  showScheduleModal.value = false;
  // 手动重置字段，确保响应式追踪
  newSchedule.value.title = "";
  newSchedule.value.startTime = "";
  newSchedule.value.duration = 30;
  newSchedule.value.remindBefore = "none";
  newSchedule.value = { title: "", startTime: "", duration: 30, remindBefore: 'none' };
};




</script>




<style scoped>
/* 日历容器 */
.calendar-container {
  max-width: 1500px;
  margin: 30px auto;
  position: relative;

  /* 加圆角、边框、阴影 */
  border-radius: 10px;
  border: 1.5px solid #C5E1A5;           /* 绿色系边框 */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.10);  /* 柔和阴影 */
  overflow: hidden; /* 防止圆角被内容撑开 */
  background-color: #fff;
}


/* 添加日程按钮 */
.add-schedule-btn {
  position: absolute;
  top: 12px;
  right: 20px;
  z-index: 1000;

  /* ✅ 背景颜色 & 字体颜色 */
  background-color: #C5E1A5;  /* 绿色背景 */
  color: #FFFFFF;                /* 白色文字 */

  /* ✅ 字体样式 */
  font-size: 16px;
  font-weight: 600;

  /* ✅ 按钮样式 */
  padding: 10px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  /* ✅ 阴影 */
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
  transition: background-color 0.4s ease, box-shadow 0.4s ease;
}

/* ✅ 悬浮效果 */
.add-schedule-btn:hover {
  background-color: #AED581;

}


:deep(.vuecal__view-btn[aria-label="Years view"]) {
  display: none !important;
}
:deep(.vuecal__view-btn) {
  order: 0;
}
:deep(.vuecal__view-btn[aria-label="Day view"]) {
  order: 1;
}
:deep(.vuecal__view-btn[aria-label="Week view"]) {
  order: 2;
}
:deep(.vuecal__view-btn[aria-label="Month view"]) {
  order: 3;
}
:deep(.vuecal__view-btn[aria-label="Year view"]) {
  order: 4;
}

/* 顶部视图按钮容器区域 */
:deep(.vuecal__flex.vuecal__menu) {
  background-color: #F1F8E9 !important; /* 淡绿背景 */
  padding: 3px 0;
  display: flex;
  justify-content: center;
  gap: 60px;
}


/* 每个视图按钮的基础样式 */
:deep(.vuecal__view-btn) {
  background: transparent !important;
  border: none !important;
  color: #4E6B50 !important;
  font-size: 18px !important;
  font-weight: 500;
  padding: 6px 12px;
  transition: all 0.4s ease;
  border-bottom: 2px solid transparent !important;
}

/* 悬浮效果 */
:deep(.vuecal__view-btn:hover) {
  background-color: #DCEDC8 !important;
  border-radius: 6px; /* 让悬浮有一点圆角 */
  cursor: pointer;
}


/* 点击效果 */
:deep(.vuecal__view-btn:active) {
  background-color: #C5E1A5 !important;
}

/* 当前激活的视图按钮 */
:deep(.vuecal__view-btn.vuecal__view-btn--active) {
  border-bottom: 4px solid #C5E1A5 !important;
  background-color: transparent !important;
  border-radius: 0;
  transition: border-bottom 0.3s ease, color 0.3s ease;
}


:deep(.vuecal__title-bar) {
  background-color: #F1F8E9 !important;
  border-bottom: 1.5px solid #C5E1A5 !important;
}

:deep(.vuecal__title-bar *) {
  color: #4E6B50 !important;
  font-size: 15px !important;
  font-weight: 600;
}


:deep(.vuecal__arrow) {
  color: #4E6B50 !important;
  font-size: 18px !important;
  padding: 6px;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

:deep(.vuecal__arrow:hover) {
  background-color: #DCEDC8 !important;
  cursor: pointer;
}



/* 星期标题背景 & 字体颜色 */
:deep(.vuecal__weekdays-headings ) {
  background-color: rgb(241, 248, 233, 0.5) !important;
  color: #4E6B50 !important;
}
:deep(.vuecal__weekdays-headings span),
:deep(.vuecal__weekdays-headings div) {
  font-size: 15px !important;
  font-weight: 600 !important;
}


/* 左侧时间轴 */
:deep(.vuecal__time-column) {
  background-color: #FFFFFF !important;
  color: #333 !important;
}


/* 选中的日期 cell 背景（例如点击时） */
:deep(.vuecal__cell--selected) {
  background-color: rgb(224, 247, 250, 0.5) !important; /* 更淡的绿色 */
  border-radius: 4px;
}

/* 今天的日期 cell 背景 */
:deep(.vuecal__cell--today) {
  background-color: rgba(232, 234, 246, 0.5) !important; /* 柔和蓝紫 */
  border-radius: 4px;
}


:deep(.vuecal__now-line) {
  position: absolute !important;
  top: 50%; /* 后续改为计算后的实际位置 */
  left: 0;
  right: 0;
  height: 2px !important;
  z-index: 10;
  background: repeating-linear-gradient(
      to right,
      #388E3C,
      #388E3C 4px,
      transparent 4px,
      transparent 8px
  ) !important;

  background-color: transparent !important;
  border: none !important;
  border-top: none !important;
}

/* 小圆点 */
:deep(.vuecal__now-line)::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 11px;
  height: 11px;
  background-color: #388E3C;
  border: 2px solid #fff;
  border-radius: 50%;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.2);
  z-index: 11;
}



:deep(.vuecal__event-time) {
  display: none !important;
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


:deep(.vuecal__event.custom-event) {
  background-color: #F1F8E9 !important; /* 清新绿 */
  color: #4E6B50;
  border: 1.5px solid #C5E1A5;
  border-radius: 5px;
  font-size: 16px;
  padding: 4px 8px;
  box-shadow: none;
  transition: 0.2s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  /* ✅ 添加居中样式 */
  display: flex;
  align-items: center;     /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  text-align: center;
}



:deep(.vuecal__event.custom-event:hover) {
  background-color: #DCEDC8 !important;
  cursor: pointer;
}



/* 弹窗整体样式 */
:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  background-color: #F9FBF7; /* 柔和奶油绿背景 */
  color: #333;
  font-family: 'Segoe UI', sans-serif;
  top: 60px;
}

/* 标题字体 */
:deep(.el-dialog__title) {
  font-size: 22px;
  font-weight: 600;
  color: #2E7D32;
}

/* 关闭按钮 */
:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #aaa;
  font-size: 18px;
}
:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #2E7D32;
}


/* 表单标签 */
:deep(.el-form-item__label) {
  font-size: 15px;
  font-weight: 500;
  color: #4E6B50;
}

/* 输入框、选择框、日期等 */
:deep(.el-input__inner),
:deep(.el-date-editor),
:deep(.el-select),
:deep(.el-input-number) {
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 14px;
}

/* 保存按钮 */
:deep(.el-button--primary) {
  background-color: #C5E1A5;
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 6px;
  transition: 0.4s ease;
}
:deep(.el-button--primary:hover) {
  background-color: #AED581;
  border: none;
}

:deep(.el-button--danger) {
  background-color: #FFAB91; /* 淡粉色 */
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 6px;
  transition: 0.4s ease;
}

:deep(.el-button--danger:hover) {
  background-color: #FF8A65; /* 深一点的粉色 */
  border: none;
}


/* 弹窗底部 */
:deep(.el-dialog__footer) {
  padding-top: 10px;
}




</style>






