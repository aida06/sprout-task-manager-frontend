<template>
  <div class="schedule-container">
  <div class="calendar-container">
    <!-- Vue Cal calendar -->
    <vue-cal
        :events="events"
        :time-from="0 * 60"
        :time-to="24 * 60"
        default-view="week"
        :available-views="['day', 'week', 'month', 'year']"
        style="height: 800px; z-index: 1;"
        @event-click="openUpdateModal"
    />

    <!-- New Schedule button -->
    <el-button type="primary" class="add-schedule-btn" @click="showCreateModal = true">
      New Schedule
    </el-button>

    <!-- Schedule the creation of pop-up Window -->
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

    <!-- Update the schedule pop-up window -->
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
  </div>
</template>


<script setup>
import { ref, onMounted} from "vue";
import "vue-cal/dist/vuecal.css";
import VueCal from "vue-cal";
import axios from "axios";
import {ElMessage, ElNotification} from "element-plus";
const userId = ref(localStorage.getItem('userId') || '');
const events = ref([]); // Calendar events


const showScheduleModal = ref(false);
const showCreateModal = ref(false);
const showUpdateModal = ref(false);
const selectedSchedule = ref({});
let reminderTimers = []; // Store the timer ID to avoid repetition


const newSchedule = ref({
  title: "",
  startTime: "",
  duration: 30, // The default is 30 minutes.
  remindBefore: 'none', // By default, no advance reminder is given
});

const checkNotificationPermission = async () => {
  const permission = Notification.permission;
  console.log("🔍 Notification permission:", permission);

  if (permission === "granted") {
    // Permission already granted, no need to notify user
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
    const res = await axios.get(`http://localhost:8080/schedule/users/${userId.value}`);
    const data = res.data;

    events.value = data.map(sch => {
      const start = new Date(sch.startTime);
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
        title: sch.title,
        duration: sch.duration / 60,
        remindBefore: sch.remindBefore,
        class: 'custom-event'
      };
    });
    setupReminders();
  } catch (err) {
    console.error("Failed to fetch schedules:", err);
  }
};


onMounted(() => {
  console.log('permission:', Notification.permission);

  checkNotificationPermission(); // Automatically detect permissions and make requests

  fetchSchedules();
});


const createScheduleEvent = async () => {
  const { title, startTime, duration, remindBefore } = newSchedule.value;


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


const updateScheduleEvent = async () => {
  const { scheduleId, title, startTime, duration, remindBefore } = selectedSchedule.value;

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
    fetchSchedules();
    showUpdateModal.value = false;
  } catch (error) {
    console.error("Failed to delete schedule:", error);
    ElMessage.error("Failed to delete schedule.");
  }
};



const closeModal = () => {
  showScheduleModal.value = false;
  newSchedule.value.title = "";
  newSchedule.value.startTime = "";
  newSchedule.value.duration = 30;
  newSchedule.value.remindBefore = "none";
  newSchedule.value = { title: "", startTime: "", duration: 30, remindBefore: 'none' };
};

</script>


<style scoped>
.schedule-container {
  background-color: #F9FBF7;
  width: 100%;
  height: 95vh;
}


.calendar-container {
  max-width: 1500px;
  margin: 30px auto;
  position: relative;
  border-radius: 10px;
  border: 1.5px solid #C5E1A5;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.10);
  overflow: hidden;
  background-color: #fff;
}


.add-schedule-btn {
  position: absolute;
  top: 12px;
  right: 20px;
  z-index: 1000;
  background-color: #C5E1A5;
  color: #FFFFFF;
  font-size: 16px;
  font-weight: 600;
  padding: 10px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
  transition: background-color 0.4s ease, box-shadow 0.4s ease;
}


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

/* Top view button container area */
:deep(.vuecal__flex.vuecal__menu) {
  background-color: #F1F8E9 !important;
  padding: 3px 0;
  display: flex;
  justify-content: center;
  gap: 60px;
}


/* The basic style of each view button */
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


:deep(.vuecal__view-btn:hover) {
  background-color: #DCEDC8 !important;
  border-radius: 6px;
  cursor: pointer;
}


:deep(.vuecal__view-btn:active) {
  background-color: #C5E1A5 !important;
}


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


/* Title background & font color of the Week */
:deep(.vuecal__weekdays-headings) {
  background-color: rgb(241, 248, 233, 0.5) !important;
  color: #4E6B50 !important;
}
:deep(.vuecal__weekdays-headings span),
:deep(.vuecal__weekdays-headings div) {
  font-size: 15px !important;
  font-weight: 600 !important;
}


/* The left timeline */
:deep(.vuecal__time-column) {
  background-color: #FFFFFF !important;
  color: #333 !important;
}


/* The selected date cell background */
:deep(.vuecal__cell--selected) {
  background-color: rgb(224, 247, 250, 0.5) !important;
  border-radius: 4px;
}

/* Today's date cell background */
:deep(.vuecal__cell--today) {
  background-color: rgba(232, 234, 246, 0.5) !important;
  border-radius: 4px;
}


:deep(.vuecal__now-line) {
  position: absolute !important;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px !important;
  z-index: 10;
  background: transparent repeating-linear-gradient(to right, #388E3C, #388E3C 4px, transparent 4px, transparent 8px) !important;
  border: none !important;
  border-top: none !important;
}

/*Small dot */
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


:deep(.vuecal__event) {
  cursor: pointer;
}

:deep(.el-form-item) {
  display: flex;
  align-items: center;
  gap: 15px;
}

:deep(.el-input),
:deep(.el-date-picker),
:deep(.el-select),
:deep(.el-input-number) {
  width: 100%;
}


:deep(.vuecal__event.custom-event) {
  background-color: #F1F8E9 !important;
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
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}


:deep(.vuecal__event.custom-event:hover) {
  background-color: #DCEDC8 !important;
  cursor: pointer;
}


:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2);
  background-color: #F9FBF7;
  color: #333;
  font-family: 'Segoe UI', sans-serif;
  top: 60px;
}


:deep(.el-dialog__title) {
  font-size: 22px;
  font-weight: 600;
  color: #2E7D32;
}


:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #aaa;
  font-size: 18px;
}
:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #2E7D32;
}



:deep(.el-form-item__label) {
  font-size: 15px;
  font-weight: 500;
  color: #4E6B50;
}


:deep(.el-input__inner),
:deep(.el-date-editor),
:deep(.el-select),
:deep(.el-input-number) {
  border-radius: 8px;
  background-color: #ffffff;
  font-size: 14px;
}


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
  background-color: #FFAB91;
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 6px;
  transition: 0.4s ease;
}

:deep(.el-button--danger:hover) {
  background-color: #FF8A65;
  border: none;
}


:deep(.el-dialog__footer) {
  padding-top: 10px;
}

</style>

