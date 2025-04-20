<template>
  <div class="task-management-container">
    <!-- Left: Create a task -->
    <div class="task-create">
      <h1>Create Task</h1>
      <el-input v-model="newTask.taskName" placeholder="Task Name" :style="{ fontSize: '16px' }"/>

      <!-- Importance & Urgency -->
      <div class="importance-urgency">
        <div class="importance">
          <h2>Importance:</h2>
          <el-input-number v-model="newTask.importance" :min="0" :max="10" step="1" label="Importance:" @change="validateInput('importance')" />
        </div>
        <div class="urgency">
          <h2>Urgency:</h2>
          <el-input-number v-model="newTask.urgency" :min="0" :max="10" step="1" label="Urgency:" @change="validateInput('urgency')" />
        </div>
      </div>

      <!-- Tag Selection & Panel -->
      <h2>Tags:</h2>
      <div class="tag-selector">
        <button @click="toggleTagPanel" class="tag-btn">
          {{ newTask.taskTag ? newTask.taskTag : "Add a tag..." }}
          <span v-if="showTagPanel">▲</span>
          <span v-else>▼</span>
        </button>

        <!-- Panel unfolding -->
        <div v-if="showTagPanel" class="tag-panel">
          <div class="tag-grid">
            <div v-for="tag in tags" :key="tag" class="tag-item" @click="selectTag(tag)">
              <span :class="{ selected: newTask.taskTag === tag }">{{ tag }}</span>
              <button class="edit-tag" @click.stop="toggleTagOptions(tag)">...</button>

              <div v-if="tagOptions === tag" class="tag-options">
                <button @click="renameTag(tag)">Rename</button>
                <button @click="removeTag(tag)">Delete</button>
              </div>
            </div>
          </div>

          <el-input v-model="newTag" placeholder="+ Enter new tag" @keyup.enter="addTag" />
        </div>
      </div>

      <!-- New Tag Input -->
      <el-input
          v-model="newTask.description"
          type="textarea"
          placeholder="Task Description"
          rows="12"
          :style="{ fontSize: '16px', marginTop: '13px', marginBottom: '12px'}"
      />
      <el-button @click="createTask" class="custom-btn">Create Task</el-button>
    </div>

    <!-- In the middle -->
    <div class="task-start">
      <h1>Select Task</h1>
      <h2>Choose Tag:</h2>
      <el-select v-model="selectedTag" placeholder="Select Tag">
        <el-option v-for="tag in tags" :key="tag" :label="tag" :value="tag" />
      </el-select>

      <!-- Task list -->
      <div class="task-list-container">
        <div v-for="task in filteredTasks" :key="task.taskId" class="task-item" :class="{ 'selected-task': selectedTask && selectedTask.taskId === task.taskId }" @click="selectTask(task)">
          <span>{{ task.taskName }} </span>
          <el-button class="task-options-btn" @click.stop="openTaskPanel(task)" type="text">...</el-button>
        </div>
      </div>
      <!-- Task Editing Panel  -->
      <div v-if="selectedTaskForEdit" class="modal-overlay">
        <div class="task-panel">
          <button class="close-btn" @click="closeTaskPanel">✖</button>
          <h3>Edit Task</h3>
          <h2>Task Name:</h2>
          <el-input v-model="selectedTaskForEdit.taskName" placeholder="Task Name" />

          <!-- Importance & Urgency -->
          <div class="importance-urgency">
            <div class="importance">
              <h2>Importance:</h2>
              <el-input-number v-model="selectedTaskForEdit.importance" :min="0" :max="10" step="1" label="Importance" @input="validateInput('importance', selectedTaskForEdit)" />
            </div>
            <div class="urgency">
              <h2>Urgency:</h2>
              <el-input-number v-model="selectedTaskForEdit.urgency" :min="0" :max="10" step="1" label="Urgency" @input="validateInput('urgency', selectedTaskForEdit)" />
            </div>
          </div>

          <h2>Description:</h2>
          <el-input type="textarea" v-model="selectedTaskForEdit.description" placeholder="Task Description" rows="9"/>

          <h4>Reward Points: <strong>{{ calculateReward(selectedTaskForEdit) }}</strong></h4>

          <!-- Save & Delete  -->
          <div class="task-panel-actions">
            <el-button  @click="deleteTask(selectedTaskForEdit)" type="danger">Delete</el-button>
            <el-button  @click="saveTaskChanges" type="primary">Update</el-button>
          </div>
        </div>
      </div>

<!--      <button @click="completeTask" :disabled="!selectedTask">✅ Complete Task</button>-->
      <el-button @click="openTimerPanel" :disabled="!selectedTask" icon="el-icon-clock" class="custom-btn">Start Focus Timer</el-button>

      <!-- Tomato clock setting panel  -->
      <div v-if="showTimerPanel" class="modal-overlay">
        <div class="task-panel">
          <button class="close-btn" @click="closeTimerPanel">✖</button>
          <h3>Set Focus Timer ⏳ </h3>
          <h4>Duration: {{ timerSettings.duration }} minutes</h4>
          <el-slider v-model="timerSettings.duration" :min="1" :max="180" step="1" />
          <el-button @click="startFocusTimer" class="custom-btn">Start</el-button>
        </div>
      </div>
    </div>

    <!--Right: List of completed tasks -->
    <div class="task-list">
      <h1>Today Completed Tasks</h1>
      <ul>
        <li v-for="task in completedTasks" :key="task.taskId">
          <input type="checkbox" checked disabled />
          {{ task.taskName }}
        </li>
      </ul>
    </div>
  </div>

</template>


<script setup>

import {ref, computed, onMounted} from "vue";
import router from "../router/index.js";
import axios from "axios";

const userId = ref(localStorage.getItem('userId') || '');

import { userTaskStore } from "../store/store.js";
import {storeToRefs} from "pinia";
import {ElMessage} from "element-plus";
const taskStore = userTaskStore();
const { userCoins } = storeToRefs(taskStore);
const { selectedTask } = storeToRefs(taskStore);
const { completedTasks } = storeToRefs(taskStore);


// Tags
const tags = ref(["Default", "Study", "Work", "Health", "Finance"]);
console.log("Initial tags:", tags.value);
// Task list
const tasks = ref([]);


const fetchUserCoins = async () => {
  if (!userId.value) return;

  try {
    const response = await axios.get("http://localhost:8080/user/coins", {
      params: { userId: userId.value }
    });
    userCoins.value = response.data; // **确保正确存储数据**
  } catch (err) {
    console.error("Failed to fetch user coins:", err);
  }
};


// Get task data
const loadTasks = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/task/users/${userId.value}`);
    tasks.value = response.data || []; // 确保 tasks.value 始终是数组
    console.log("Tasks loaded:", tasks.value);
  } catch (error) {
    console.error("Failed to load tasks:", error);
    tasks.value = []; // 避免 tasks 变成 undefined
  }
};

onMounted(() => {
  loadTasks();
});



const newTask = ref({
  taskName: "",
  importance: 0,
  urgency: 0,
  taskTag: "Default", // 默认选中
  description: "",
});

const newTag = ref("");

const showTagPanel = ref(false);

// The Tag indicating that the "Edit/Delete" option
const tagOptions = ref(null);

const selectedTag = ref("Default");

const selectedTaskForEdit = ref(null);


/** ---------------
 *    Left Side
 *  ---------------- */
const validateInput = (field) => {
  if (newTask.value && newTask.value[field] !== undefined) {
    newTask.value[field] = Math.min(10, Math.max(0, Math.round(newTask.value[field])));
  }
  if (selectedTaskForEdit.value && selectedTaskForEdit.value[field] !== undefined) {
    selectedTaskForEdit.value[field] = Math.min(10, Math.max(0, Math.round(selectedTaskForEdit.value[field])));
  }
};

// Filter out the task list under the currently selected Tag
const filteredTasks = computed(() => {
  return tasks.value.filter((task) => task.taskTag === selectedTag.value);
});


const toggleTagPanel = () => {
  console.log("Current tags:", tags.value);
  console.log("Current newTask.taskTag:", newTask.value.taskTag);
  showTagPanel.value = !showTagPanel.value;
  tagOptions.value = null; // 关闭二级编辑选项
};

const selectTag = (tag) => {
  newTask.value.taskTag = tag
  // 选完就关闭面板
  showTagPanel.value = false
}

// Switch the "Rename/Delete" operation option of a certain Tag
const toggleTagOptions = (tag) => {
  tagOptions.value = tagOptions.value === tag ? null : tag;
};


const addTag = () => {
  if (newTag.value && !tags.value.includes(newTag.value)) {
    tags.value.push(newTag.value);
    newTag.value = "";
  }
};


const renameTag = async (oldTag) => {
  const newName = prompt(`Rename tag "${oldTag}":`, oldTag);
  if (!newName || newName === oldTag || tags.value.includes(newName)) return;

  try {
    const response = await axios.put("http://localhost:8080/task/tag/rename", null, {
      params: {
        oldTag: oldTag,
        newTag: newName,
        userId: userId.value,
      },
    });
    console.log("Rename tag response:", response.data);

    // Update 'tags' on the front end
    tags.value = tags.value.map((tag) => (tag === oldTag ? newName : tag));

    // If the current 'newTask.taskTag' is an old tag, update it
    if (newTask.value.taskTag === oldTag) {
      newTask.value.taskTag = newName;
    }

    // If 'selectedTag' is an old tag, update it as well
    if (selectedTag.value === oldTag) {
      selectedTag.value = newName;
    }

    tagOptions.value = null;
  } catch (err) {
    console.error("Failed to rename tag:", err);
    ElMessage.error('Rename failed, please check the console.');
  }
};

const removeTag = async (taskTag) => {
  if (!confirm(`Are you sure you want to delete the tag "${taskTag}"? All tasks under this tag will be removed.`)) {
    return;
  }

  try {
    const response = await axios.delete("http://localhost:8080/task/tag/delete", {
      params: { taskTag: taskTag, userId: userId.value }
    });

    console.log("Delete tag response:", response.data);

    // The corresponding items in the tags are synchronously deleted at the front end
    tags.value = tags.value.filter(tag => tag !== taskTag);

    // If the deleted tag is the currently selected one, switch to the first tag
    if (newTask.value.taskTag === taskTag) {
      newTask.value.taskTag = tags.value.length > 0 ? tags.value[0] : "";
    }

    if (selectedTag.value === taskTag) {
      selectedTag.value = tags.value.length > 0 ? tags.value[0] : "";
    }

    tagOptions.value = null;  // Close the pop-up menu
  } catch (err) {
    console.error("Failed to delete tag:", err);
    ElMessage.error("Failed to delete the tag, please check the console.");
  }
};

const createTask = async () => {
  if (!newTask.value.taskName) {
    ElMessage.error('Task Name is required!');
    return;
  }

  const payload = {
    taskName: newTask.value.taskName,
    importance: newTask.value.importance,
    urgency: newTask.value.urgency,
    taskTag: newTask.value.taskTag,
    description: newTask.value.description,
    rewardCoins: calculateReward(newTask.value),
    userId: userId.value
  };

  try {
    await axios.post("http://localhost:8080/task", payload);
    console.log("Task created successfully");

    // Reload the task list after the task is created
    await loadTasks();

    // Empty the input box
    newTask.value = {
      taskName: "",
      importance: 0,
      urgency: 0,
      taskTag: "Default",
      description: ""
    };

  } catch (error) {
    console.error("Failed to create task:", error);
    ElMessage.success("Failed to create a task. Please check the console");
  }
};


/** -----------------------------
 *  Middle
 *  ----------------------------- */

const selectTask = (task) => {
  selectedTask.value = selectedTask.value?.taskId === task.taskId ? null : { ...task };
};


const completeTask = async () => {
  if (!selectedTask.value) return;

  try {
    // **发送后端请求更新积分**
    await axios.post("http://localhost:8080/user/updateCoins", {
      userId: userId.value,
      rewardCoins: Number(selectedTask.value.rewardCoins)
    });

    // **前端手动更新 userCoins**
    // userCoins.value += selectedTask.value.rewardCoins;
    userCoins.value = Number((userCoins.value + selectedTask.value.rewardCoins).toFixed(2));

    completedTasks.value.push(selectedTask.value);
    selectedTask.value = null;
  } catch (err) {
    console.error("Failed to update coins:", err);
  }
};

const calculateReward = (task) => {
  return parseFloat((0.6 * task.importance + 0.4 * task.urgency + 5).toFixed(2));
};


const openTaskPanel = (task) => {
  selectedTaskForEdit.value = { ...task };
};


const closeTaskPanel = () => {
  selectedTaskForEdit.value = null;
};


const saveTaskChanges = async () => {
  if (!selectedTaskForEdit.value) return;

  try {
    // 先构造一个 payload，字段名要跟后端的 Task 实体对应：
    const payload = {
      taskId: selectedTaskForEdit.value.taskId,
      taskName: selectedTaskForEdit.value.taskName,
      importance: selectedTaskForEdit.value.importance,
      urgency: selectedTaskForEdit.value.urgency,
      description: selectedTaskForEdit.value.description,
      rewardCoins: calculateReward(selectedTaskForEdit.value),
      userId: userId.value,
    };

    // 调用后端的 PUT 接口
    const response = await fetch("http://localhost:8080/task/update", {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const msg = await response.text();
      ElMessage.error('Update failed: ' + msg);
      return;
    }

    // 如果成功，就更新本地 tasks 数组以刷新 UI
    const index = tasks.value.findIndex(
        (t) => t.taskId === selectedTaskForEdit.value.taskId
    );
    if (index !== -1) {
      tasks.value[index] = { ...selectedTaskForEdit.value };
    }

    ElMessage.success('Task updated successfully!');
  } catch (error) {
    console.error(error);
    ElMessage.error('Error updating task');
  } finally {
    closeTaskPanel();
  }
};


const deleteTask = async (task) => {
  if (!confirm(`Are you sure you want to delete task "${task.taskName}"?`)) return;

  try {
    await axios.delete(`http://localhost:8080/task/delete`, {
      params: { taskId: task.taskId }
    });

    // 从任务列表中删除
    tasks.value = tasks.value.filter(t => t.taskId !== task.taskId);
    selectedTaskForEdit.value = null;
    ElMessage.success("Task deleted successfully!");
  } catch (err) {
    console.error("Failed to delete task:", err);
    ElMessage.error("Error deleting task. Please try again.");
  }
};

// Tomato clock setting status
const showTimerPanel = ref(false);
const timerSettings = ref({ duration: 30 });

const openTimerPanel = () => {
  showTimerPanel.value = true;
};

const closeTimerPanel = () => {
  showTimerPanel.value = false;
};

const startFocusTimer = () => {
  closeTimerPanel();
  router.push({
    path: "/focus-timer",
    query: { duration: timerSettings.value.duration }
  });
};

/** -----------------------------
 *  Right Side
 *  ----------------------------- */
const fetchTodayCompletedTasks = async () => {
  try {
    const response = await axios.get(`http://localhost:8080/focusTimer/users/${userId.value}/todayCompletedTasks`);
    // Assign the returned data to completedTasks
    completedTasks.value = response.data.map(taskName => ({ taskName }));
    console.log("Fetched TodayCompletedTasks:", completedTasks.value );
  } catch (error) {
    console.error('Error fetching completed tasks:', error);
  }
};

onMounted(() => {
  fetchTodayCompletedTasks();
});
</script>

<style scoped>

.task-management-container {
  background-color: #F9FBF7;
  width: 99%;
  height: 83vh;
  display: flex;
  justify-content: space-around;
  gap: 5px;
  padding: 30px 10px;
  font-family: Arial, sans-serif;

}

/* -----------------------------
   Left: Create the task area
   ----------------------------- */
.task-create {
  margin-top: 15px;
  justify-content: center;
  align-items: center;
  width: 26%;
  padding: 20px 35px;
  border: 1.5px solid #C5E1A5;
  border-radius: 8px;
  background-color: rgb(241, 248, 233, 0.7);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.10);

}


.importance-urgency {
  color: #4e6b50;
  display: flex;
  justify-content: space-between;


}

.importance,
.urgency {
  width: 40%;
}


textarea {
  margin: 5px 0;
  padding: 8px;
  font-size: 18px;
  box-sizing: border-box;
  width: 100%;
  height: 300px;
  resize: none;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

.custom-btn {
  margin-top: 20px;
  width: 100%;
  height: 45px;
  position: relative;
  padding: 10px 16px;
  font-size: 20px;
  font-weight: 600;
  background-color: #C5E1A5;
  color: #FFFFFF;
  border: none;
  border-radius: 5px;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
  transition: background-color 0.4s ease, box-shadow 0.4s ease;
}

.custom-btn:hover {
  color: #FFFFFF;
  background-color: #AED581 ;
}


.tag-selector {
  color: #4e6b50;
  position: relative;
  margin-bottom: 10px;
  border: 1.5px solid #E0E2E9;
  border-radius: 4px;
  font-size: 16px;
}

.tag-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px;
  background: white;
  color: #4e6b50;
  border: none;
  cursor: pointer;
  font-size: 16px;
}


.tag-panel {
  position: absolute;
  background: rgb(255, 255, 255);
  border: 1.5px solid #E0E2E9;
  padding: 20px;
  width: 90%;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  z-index: 999; /* Let the panel float above */
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.tag-item {
  display: flex;
  align-items: center;
  background: rgb(220, 237, 200, 1);
  color: #4e6b50;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  user-select: none;
  transition: background-color 0.4s, color 0.4s;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  gap: 25px;
  height: 22px;
}

/* Hover Effect */
.tag-item:hover {
  background-color: #C5E1A5; /* Lighter blue on hover */
}

.tag-item .edit-tag {
  background: rgb(255, 255, 255,0.6);
  border: none;
  color: #4e6b50;
  cursor: pointer;
  margin-left: auto;
  border-radius: 3px;
}

/* Tag 编辑/删除 选项 */
.tag-options {
  position: absolute;
  top: 30px;
  left: 50px;
  background: white;
  border: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  padding: 5px;
  z-index: 1000;
}

.tag-options button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  text-align: left;
  width: 100%;
}

.tag-options button:hover {
  background: #eee;
}

/* -----------------------------
   Middle: Select the task
   ----------------------------- */
.task-start {
  margin-top: 15px;
  justify-content: center;
  align-items: center;
  width: 26%;
  padding: 20px 35px;
  border: 1.5px solid #C5E1A5;
  border-radius: 8px;
  background-color: rgb(241, 248, 233, 0.7);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.10);

}

.task-list-container {
  background: white;
  height: 420px;
  overflow-y: auto;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
  border: 1.5px solid #E0E2E9;
}


.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #E0E2E9;
  color: #4e6b50;
  font-size: 17px;
}

.task-item:hover {
  background: #F5F7FA;
  cursor: pointer;
}


.selected-task {
  background-color: rgb(236, 239, 241, 0.8);
  border-radius: 5px;
  transition: background 0.04s ease;
}

.task-options-btn {
  background: rgb(220, 237, 200,0.7);
  color: #4e6b50;
  border: none;
  cursor: pointer;
  padding: 10px;
  border-radius: 4px;
  width: 35px;
}

.task-options-btn:hover {
  background: rgb(220, 237, 200,0.7) !important;
  color: #4e6b50 !important;
}

/* Task Editing Panel - Centered and suspended */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5); /* 背景变暗 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.task-panel {
  background: #F9FBF7;
  padding: 25px;
  width: 450px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  position: relative;
}


.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  font-size: 20px;
  font-weight: bold;
  color: #9E9E9E;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;
}


.close-btn:hover {
  background: rgba(0, 0, 0, 0);
  color: #4e6b50;
}

.task-panel-actions {
  display: flex;
  gap: 0px;
  justify-content: flex-end;
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


::v-deep .el-slider__button {
  background-color: white; /* 更深绿色 */
  border-color: #A5D6A7;
}


::v-deep .el-slider__bar {
  background-color: #A5D6A7;
}

/* -----------------------------
   Right side: Completed task
   ----------------------------- */
.task-list {
  margin-top: 15px;
  justify-content: center;
  align-items: center;
  width: 26%;
  padding: 20px 35px;
  border: 1.5px solid #C5E1A5;
  border-radius: 8px;
  font-size: 18px;
  color: #4e6b50;
  background-color: rgb(241, 248, 233, 0.7);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.10);
}


.task-list ul {
  list-style: none;
  padding: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
  border-bottom: 1px solid #E0E2E9; /* Add a dividing line */
}

/* 让复选框更小巧 */
.task-list input[type="checkbox"] {
  width: 18px;
  height: 18px;
}


/* -----------------------------
   General
   ----------------------------- */
button:disabled {
  background-color: #ECEFF1;
  cursor: not-allowed;
}


h1 {
  text-align: center;
  color: #4E6B50;
  font-size: 30px;
}

h3 {
  text-align: center;
  color: #4e6b50;
  font-size: 24px;
}

h4 {
  color: #4e6b50;
  font-size: 18px;
}

h2 {
  color: #4e6b50;
  font-size: 16px;
}

p {
  color: #666;
  font-size: 1.2rem;
}

</style>
