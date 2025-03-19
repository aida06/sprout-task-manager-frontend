<template>
  <div class="task-management-container">
    <!-- 左侧：创建任务 -->
    <div class="task-create">
      <h1>Create Task</h1>
      <input v-model="newTask.taskName" placeholder="Task Name" />

      <!-- Importance & Urgency  -->
      <div class="importance-urgency">
        <div class="importance">
          <label>Importance:</label>
          <input type="number" v-model="newTask.importance" min="0" max="10" step="1" @change="validateInput('importance')"/>
        </div>
        <div class="urgency">
          <label>Urgency:</label>
          <input type="number" v-model="newTask.urgency" min="0" max="10" step="1" @change="validateInput('urgency')"/>
        </div>
      </div>

      <!-- Tag 选择 & 面板 -->
      <label>Tags:</label>
      <div class="tag-selector">
        <!-- 1) 根据是否有 newTask.taskTag 显示不同的文字 -->
        <button @click="toggleTagPanel" class="tag-btn">
          {{ newTask.taskTag ? newTask.taskTag : "Add a tag..." }}
          <span v-if="showTagPanel">▲</span>
          <span v-else>▼</span>
        </button>

        <!-- 2) 面板展开 -->
        <div v-if="showTagPanel" class="tag-panel">
          <div class="tag-grid">
            <div v-for="tag in tags" :key="tag" class="tag-item" @click="selectTag(tag)">
            <span :class="{ selected: newTask.taskTag === tag }">{{ tag }}</span>
            <!-- 阻止“⚙”冒泡，以免触发 selectTag -->
            <button class="edit-tag" @click.stop="toggleTagOptions(tag)">⚙️</button>

            <div v-if="tagOptions === tag" class="tag-options">
              <button @click="renameTag(tag)">Rename</button>
              <button @click="removeTag(tag)">Delete</button>
            </div>
          </div>
        </div>

        <!-- 新建 Tag 的输入框也放在面板里 -->
        <input v-model="newTag" placeholder="+ Enter new tag" @keyup.enter="addTag"/>
      </div>
    </div>

      <textarea v-model="newTask.description" placeholder="Description"></textarea>
      <button @click="createTask">➕ Create Task</button>
    </div>

    <!-- 中间 -->
    <div class="task-start">
      <h1>Select Task</h1>

      <label>Choose Tag:</label>
      <select v-model="selectedTag">
        <option v-for="tag in tags" :key="tag">{{ tag }}</option>
      </select>

      <!-- 任务列表 -->
      <div class="task-list-container">
        <div v-for="task in filteredTasks"
            :key="task.taskId"
            class="task-item"
            :class="{ 'selected-task': selectedTask && selectedTask.taskId === task.taskId }"
            @click="selectTask(task)"
        >
          <!-- 选择任务 -->
          <span>{{ task.taskName }} </span>
          <!-- `...` 按钮 -->
          <button class="task-options-btn" @click.stop="openTaskPanel(task)">...</button>
        </div>
      </div>
      <!-- 任务编辑小面板（悬浮居中） -->
      <div v-if="selectedTaskForEdit" class="modal-overlay">
        <div class="task-panel">
          <!-- 右上角取消按钮 -->
          <button class="close-btn" @click="closeTaskPanel">✖</button>

          <h2>Edit Task</h2>
          <label>Task Name:</label>
          <input v-model="selectedTaskForEdit.taskName" />

          <!-- Importance & Urgency 并排 -->
          <div class="importance-urgency">
            <div class="importance">
              <label>Importance:</label>
              <input type="number" v-model="selectedTaskForEdit.importance" min="0" max="10" step="1" @input="validateInput('importance', selectedTaskForEdit)" />
            </div>
            <div class="urgency">
              <label>Urgency:</label>
              <input type="number" v-model="selectedTaskForEdit.urgency" min="0" max="10" step="1" @input="validateInput('urgency', selectedTaskForEdit)" />
            </div>
          </div>

          <label>Description:</label>
          <textarea v-model="selectedTaskForEdit.description"></textarea>

          <p>Reward Points: <strong>{{ calculateReward(selectedTaskForEdit) }}</strong></p>

          <!-- Save 按钮 -->
<!--          <div class="task-panel-actions">-->
<!--            <button class="save-btn" @click="saveTaskChanges">Save</button>-->
<!--          </div>-->
          <!-- Save & Delete 按钮 -->
          <div class="task-panel-actions">
            <button class="delete-btn" @click="deleteTask(selectedTaskForEdit)">🗑️ Delete Task</button>
            <button class="save-btn" @click="saveTaskChanges">💾 Save Task</button>
          </div>
        </div>
      </div>

<!--      <button @click="completeTask" :disabled="!selectedTask">✅ Complete Task</button>-->
      <button @click="openTimerPanel" :disabled="!selectedTask">⏳ Start Focus Timer</button>

      <!-- 番茄钟设定面板 -->
      <div v-if="showTimerPanel" class="modal-overlay">
        <div class="task-panel">
          <button class="close-btn" @click="closeTimerPanel">✖</button>
          <h2>Set Focus Timer</h2>
          <label>Duration: {{ timerSettings.duration }} minutes</label>
          <!-- 滑动条 -->
          <input type="range" v-model="timerSettings.duration" min="0.1" max="180.1" step="1"/>
          <!-- Start 按钮 -->
          <button class="save-btn" @click="startFocusTimer">Start</button>
        </div>
      </div>
    </div>

    <!-- 右侧：已完成任务列表 -->
    <div class="task-list">
      <h1>Completed Tasks</h1>
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

import {ref, computed, onMounted, inject, provide} from "vue";
import router from "../router/index.js";
import axios from "axios";

import { userTaskStore } from "../store/store.js";
import {storeToRefs} from "pinia";

const userId = ref(localStorage.getItem("userId"));

const taskStore = userTaskStore();
const { userCoins } = storeToRefs(taskStore);
const { selectedTask } = storeToRefs(taskStore);
const { completedTasks } = storeToRefs(taskStore);


// 标签（Tag）
const tags = ref(["Default", "Study", "Work", "Health", "Finance"]);
console.log("Initial tags:", tags.value);
// 任务列表
const tasks = ref([]);

// 组件加载时，获取任务数据
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
  loadTasks(); // 组件挂载后调用
});


// 新建任务输入
const newTask = ref({
  taskName: "",
  importance: 0,
  urgency: 0,
  taskTag: "Default", // 默认选中
  description: "",
});

// 新建标签输入
const newTag = ref("");

// 用于控制 Tag 选择面板和编辑弹窗
const showTagPanel = ref(false);

const tagOptions = ref(null); // 表示当前正在显示 “Edit/Delete” 选项的 Tag

// 选择的 Tag（用于筛选任务）
const selectedTag = ref("Default");


const selectedTaskForEdit = ref(null);


/** -----------------------------
 *  左边
 *  ----------------------------- */
const validateInput = (field) => {
  if (newTask.value && newTask.value[field] !== undefined) {
    newTask.value[field] = Math.min(10, Math.max(0, Math.round(newTask.value[field])));
  }
  if (selectedTaskForEdit.value && selectedTaskForEdit.value[field] !== undefined) {
    selectedTaskForEdit.value[field] = Math.min(10, Math.max(0, Math.round(selectedTaskForEdit.value[field])));
  }
};

// 筛选出当前选中 Tag 下的任务列表
const filteredTasks = computed(() => {
  return tasks.value.filter((task) => task.taskTag === selectedTag.value);
});


// 切换 Tag 面板显示/隐藏
const toggleTagPanel = () => {
  console.log("Current tags:", tags.value);
  console.log("Current newTask.taskTag:", newTask.value.taskTag);
  showTagPanel.value = !showTagPanel.value;
  tagOptions.value = null; // 关闭二级编辑选项
};

// 选择 Tag
const selectTag = (tag) => {
  newTask.value.taskTag = tag
  // 选完就关闭面板
  showTagPanel.value = false
}

// 切换某个 Tag 的「重命名 / 删除」操作选项
const toggleTagOptions = (tag) => {
  tagOptions.value = tagOptions.value === tag ? null : tag;
};

// 添加新标签
const addTag = () => {
  if (newTag.value && !tags.value.includes(newTag.value)) {
    tags.value.push(newTag.value);
    newTag.value = "";
  }
};

// 重命名 Tag
const renameTag = async (oldTag) => {
  const newName = prompt(`Rename tag "${oldTag}":`, oldTag);
  if (!newName || newName === oldTag || tags.value.includes(newName)) return;

  try {
    // 调用后端 API
    const response = await axios.put("http://localhost:8080/task/tag/rename", null, {
      params: {
        oldTag: oldTag,
        newTag: newName,
        userId: userId.value,  // 确保传入 userId
      },
    });

    console.log("Rename tag response:", response.data);

    // 1. **前端更新 `tags`**
    tags.value = tags.value.map((tag) => (tag === oldTag ? newName : tag));

    // 2. **如果当前 `newTask.taskTag` 是旧的 tag，更新**
    if (newTask.value.taskTag === oldTag) {
      newTask.value.taskTag = newName;
    }

    // 3. **如果 `selectedTag` 是旧的 tag，也更新**
    if (selectedTag.value === oldTag) {
      selectedTag.value = newName;
    }

    tagOptions.value = null;
  } catch (err) {
    console.error("Failed to rename tag:", err);
    alert("Rename failed, please check the console.");
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

    // 1️. **前端同步删除 tags 中的对应项**
    tags.value = tags.value.filter(tag => tag !== taskTag);

    // 2️. **如果删除的 tag 是当前选中的，切换到第一个 tag**
    if (newTask.value.taskTag === taskTag) {
      newTask.value.taskTag = tags.value.length > 0 ? tags.value[0] : "";
    }

    if (selectedTag.value === taskTag) {
      selectedTag.value = tags.value.length > 0 ? tags.value[0] : "";
    }

    tagOptions.value = null;  // 关闭弹出菜单
  } catch (err) {
    console.error("Failed to delete tag:", err);
    alert("Failed to delete the tag, please check the console.");
  }
};

const createTask = async () => {
  if (!newTask.value.taskName) {
    alert("Task Name is required!");
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

    // **任务创建后重新加载任务列表**
    await loadTasks();

    // 清空输入框
    newTask.value = {
      taskName: "",
      importance: 0,
      urgency: 0,
      taskTag: "Default",
      description: ""
    };

  } catch (error) {
    console.error("Failed to create task:", error);
    alert("Failed to create a task. Please check the console");
  }
};


/** -----------------------------
 *  中间
 *  ----------------------------- */
// 选择任务
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

// 打开任务编辑面板
const openTaskPanel = (task) => {
  selectedTaskForEdit.value = { ...task };
};

// 关闭任务编辑面板
const closeTaskPanel = () => {
  selectedTaskForEdit.value = null;
};

// 保存修改的任务
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
      alert('Update failed: ' + msg);
      return;
    }

    // 如果成功，就更新本地 tasks 数组以刷新 UI
    const index = tasks.value.findIndex(
        (t) => t.taskId === selectedTaskForEdit.value.taskId
    );
    if (index !== -1) {
      tasks.value[index] = { ...selectedTaskForEdit.value };
    }

    alert('Task updated successfully!');
  } catch (error) {
    console.error(error);
    alert('Error updating task');
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
    alert("Task deleted successfully!");
  } catch (err) {
    console.error("Failed to delete task:", err);
    alert("Error deleting task. Please try again.");
  }
};

// 番茄钟设定状态
const showTimerPanel = ref(false);
const timerSettings = ref({ duration: 30 });

// 打开番茄钟设定面板
const openTimerPanel = () => {
  showTimerPanel.value = true;
};

// 关闭番茄钟设定面板
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

</script>

<style scoped>
/* -----------------------------
   大容器布局
   ----------------------------- */
.task-management-container {
  width: 99%;
  height: 95%;
  display: flex;
  justify-content: space-around;
  gap: 20px;
  padding: 30px 10px;
  font-family: Arial, sans-serif;

}

/* -----------------------------
   左侧：创建任务区域
   ----------------------------- */
.task-create {
  width: 28%;
  padding: 30px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}


.importance-urgency {
  display: flex;
  justify-content: space-between;
}

.importance,
.urgency {
  width: 48%;
}

/* Tag 选择 & 面板 */
.tag-selector {
  position: relative;
  margin-bottom: 10px;
}

.tag-btn {
  display: flex;                /* 让内部子元素可分左右 */
  justify-content: space-between; /* 左右两端对齐 */
  align-items: center;          /* 垂直方向居中 */
  width: 100%;
  padding: 8px;
  background: white;
  color: #2c3e50;
  border: none;
  cursor: pointer;
}

.tag-btn:hover {
  background-color: #ECEFF1; /* Lighter blue on hover */

}

.tag-panel {
  position: absolute;
  background: white;
  border: 1px solid #ddd;
  padding: 20px;
  width: 90%;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  z-index: 999; /* 让面板浮在上方 */
}

.tag-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.tag-item {
  display: flex;
  align-items: center;
  background: #e3f2fd;
  color: #1565c0;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  position: relative;
  user-select: none;
  transition: background-color 0.4s, color 0.4s;
}

/* Hover Effect */
.tag-item:hover {
  background-color: #bbdefb; /* Lighter blue on hover */
  color: #0d47a1;           /* Darker text color on hover */
}

.tag-item .edit-tag {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  margin-left: 10px;
}

/* Tag 编辑/删除 选项 */
.tag-options {
  position: absolute;
  top: 30px;
  left: 20px;
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
   中间：选择任务
   ----------------------------- */
.task-start {
  width: 28%;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.task-list-container {
  height: 400px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  margin: 10px 0;
}

/* 让任务项右侧的 `...` 按钮对齐 */
.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
.task-item:hover {
  background: #ECEFF1;
  cursor: pointer;
}

/* 选中的任务项样式 */
.selected-task {
  background-color: #CFD8DC;
  border-radius: 5px;
  transition: background 0.01s ease;
}

.task-options-btn {
  background: #f1f1f1;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  width: 30px;
}

/* 任务编辑面板 - 居中悬浮 */
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
  background: white;
  padding: 20px;
  width: 450px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  position: relative;
}

/* 右上角 X 关闭按钮 */
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
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease, color 0.2s ease;
}

/* 悬浮时，X 变灰色，增强交互感 */
.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #000;
}

.task-panel-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 20px;
}

.delete-btn {
  background-color: #ECEFF1;
  color: #333;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #CFD8DC;
  color: #000;
}



/* -----------------------------
   右侧：已完成任务
   ----------------------------- */
.task-list {
  width: 28%;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

/* 让 Completed Task 更好看 */
.task-list ul {
  list-style: none;
  padding: 0;
}

.task-list li {
  display: flex;
  align-items: center;
  gap: 10px;  /* 让复选框和文字有间距 */
  padding: 8px 0;
  border-bottom: 1px solid #ddd; /* 添加分割线 */
}

/* 让复选框更小巧 */
.task-list input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

/* 优化滑动条
input[type="range"] {
  width: 100%;
  margin: 10px 0;
  appearance: none;
  height: 5px;
  background: #ddd;
  border-radius: 5px;
  outline: none;
  transition: background 0.3s;
}

input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  background: #007bff;
  border-radius: 50%;
  cursor: pointer;
}


input[type="number"] {
  width: 60px;
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  margin-top: 5px;
}
*/

/* -----------------------------
   通用
   ----------------------------- */
input,
button,
select {
  margin: 5px 0;
  padding: 8px;
  font-size: 16px;
  box-sizing: border-box;
  width: 100%;
}


textarea {
  margin: 5px 0;
  padding: 8px;
  font-size: 16px;
  box-sizing: border-box;
  width: 100%;
  height: 300px;
  resize: none;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

button {
  background-color: #e3f2fd;
  color: #1565c0;
  border: none;
  cursor: pointer;
  font-weight: bold;
  border-radius: 6px; /* Rounded corners */
  transition: background-color 0.4s, color 0.4s; /* Smooth hover transition */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Soft shadow for depth */
}
/* Hover Effect */
button:hover {
  background-color: #bbdefb; /* Lighter blue on hover */
  color: #0d47a1;           /* Darker text color on hover */
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

/* 其它示例文字样式 */
h1 {
  text-align: center;
  color: #2c3e50;
  font-size: 30px;
}

h2 {
  text-align: center;
}


p {
  color: #666;
  font-size: 1.2rem;
}
</style>
