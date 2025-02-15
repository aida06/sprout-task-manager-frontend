<template>
  <div class="task-management-container">
    <!-- 左侧：创建任务（融合版本2的 Tag 选择/编辑） -->
    <div class="task-create">
      <h1>Create Task</h1>
      <input v-model="newTask.name" placeholder="Task Name" />

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
        <!-- 1) 根据是否有 newTask.tag 显示不同的文字 -->
        <button @click="toggleTagPanel" class="tag-btn">
          {{ newTask.tag ? newTask.tag : "Add a tag..." }}
          <span v-if="showTagPanel">▲</span>
          <span v-else>▼</span>
        </button>

        <!-- 2) 面板展开 -->
        <div v-if="showTagPanel" class="tag-panel">
          <div class="tag-grid">
            <div
                v-for="tag in tags"
                :key="tag"
                class="tag-item"
                @click="selectTag(tag)">
            <span :class="{ selected: newTask.tag === tag }">{{ tag }}</span>
            <!-- 阻止“⚙”冒泡，以免触发 selectTag -->
            <button class="edit-tag" @click.stop="toggleTagOptions(tag)">⚙</button>

            <div v-if="tagOptions === tag" class="tag-options">
              <button @click="renameTag(tag)">Rename</button>
              <button @click="removeTag(tag)">Delete</button>
            </div>
          </div>
        </div>

        <!-- 新建 Tag 的输入框也放在面板里 -->
        <input
            v-model="newTag"
            placeholder="+ Create new tag"
            @keyup.enter="addTag"
        />
      </div>
    </div>

      <textarea v-model="newTask.description" placeholder="Description"></textarea>
      <button @click="createTask">Create Task</button>
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
        <div
            v-for="task in filteredTasks"
            :key="task.id"
            class="task-item"
            :class="{ 'selected-task': selectedTask && selectedTask.id === task.id }"
            @click="selectTask(task)"
        >
          <!-- 选择任务 -->
          <span>{{ task.name }} </span>
          <!-- `...` 按钮 -->
          <button class="task-options-btn" @click.stop="openTaskPanel(task)">...</button>
        </div>
      </div>

      <button @click="startTask" :disabled="!selectedTask">Start Task</button>
    </div>

    <!-- 右侧：已完成任务列表 -->
    <div class="task-list">
      <h1>Completed Tasks</h1>
      <ul>
        <li v-for="task in completedTasks" :key="task.id">
          <input type="checkbox" checked disabled />
          {{ task.name }}
        </li>
      </ul>
    </div>
  </div>


</template>

<script setup>

import { ref, computed } from "vue";

// 标签（Tag）
const tags = ref(["Work", "Personal", "Health", "Finance"]);
// 任务列表
const tasks = ref([]);
// 已完成任务列表
const completedTasks = ref([]);
// 新建任务输入
const newTask = ref({
  name: "",
  importance: 0,
  urgency: 0,
  tag: "Work", // 默认选中 Work
  description: "",
});

// 新建标签输入
const newTag = ref("");

// 用于控制 Tag 选择面板和编辑弹窗
const showTagPanel = ref(false);
const tagOptions = ref(null); // 表示当前正在显示 “Edit/Delete” 选项的 Tag

// 选择的 Tag（用于筛选任务）
const selectedTag = ref("Work");

// 当前选中的任务
const selectedTask = ref(null);

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
  return tasks.value.filter((task) => task.tag === selectedTag.value);
});

// 切换 Tag 面板显示/隐藏
const toggleTagPanel = () => {
  showTagPanel.value = !showTagPanel.value;
  tagOptions.value = null; // 关闭二级编辑选项
};

// 选择 Tag
const selectTag = (tag) => {
  newTask.value.tag = tag
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
const renameTag = (oldTag) => {
  const newName = prompt(`Rename tag "${oldTag}":`, oldTag);
  if (!newName || newName === oldTag || tags.value.includes(newName)) return;

  // 更新 tags 数组
  tags.value = tags.value.map((tag) => (tag === oldTag ? newName : tag));

  // 同时更新任务中对应的 tag
  tasks.value.forEach((task) => {
    if (task.tag === oldTag) {
      task.tag = newName;
    }
  });
  // 若选择中的 Tag 也被重命名了，则一并更新
  if (selectedTag.value === oldTag) {
    selectedTag.value = newName;
  }
  tagOptions.value = null;
};

// 删除 Tag（同时删除该 Tag 下的所有任务）
const removeTag = (tag) => {
  if (
      confirm(
          `Are you sure you want to delete the tag "${tag}"? All tasks under this tag will be removed.`
      )
  ) {
    tags.value = tags.value.filter((t) => t !== tag);
    tasks.value = tasks.value.filter((task) => task.tag !== tag);
    if (selectedTag.value === tag) {
      // 若删除的刚好是当前选中的 Tag，则切换到第一个标签或空
      selectedTag.value = tags.value[0] || "";
    }
    tagOptions.value = null;
  }
};

// 创建任务
const createTask = () => {
  if (!newTask.value.name) return alert("Task Name is required!");

  const task = {
    id: Date.now(),
    name: newTask.value.name,
    importance: newTask.value.importance,
    urgency: newTask.value.urgency,
    tag: newTask.value.tag,
    description: newTask.value.description,
  };
  tasks.value.push(task);

  // 重置输入
  newTask.value.name = "";
  newTask.value.importance = 0;
  newTask.value.urgency = 0;
  newTask.value.tag = "Work";
  newTask.value.description = "";
};


/** -----------------------------
 *  中间
 *  ----------------------------- */

// 选择任务
// const selectTask = (task) => {
//       selectedTask.value = task;
//     };

const selectTask = (task) => {
  console.log("Before selection:", selectedTask.value); // 调试用
  selectedTask.value = selectedTask.value?.id === task.id ? null : { ...task };
  console.log("After selection:", selectedTask.value); // 调试用
};

// 开始任务
// const startTask = () => {
//   if (selectedTask.value) {
//     console.log("Starting task:", selectedTask.value.name);
//   }
// };

// 开始任务并移动到完成列表
const startTask = () => {
  if (!selectedTask.value) return;

  completedTasks.value.push(selectedTask.value);
  tasks.value = tasks.value.filter(
      (task) => task.id !== selectedTask.value.id
  );
  selectedTask.value = null;
};


// 计算奖励点数
const calculateReward = (task) => {
  return (0.6 * task.importance + 0.4 * task.urgency + 5).toFixed(2);
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
const saveTaskChanges = () => {
  if (selectedTaskForEdit.value) {
    const index = tasks.value.findIndex((t) => t.id === selectedTaskForEdit.value.id);
    if (index !== -1) {
      tasks.value[index] = { ...selectedTaskForEdit.value };
    }
    closeTaskPanel();
  }
};

</script>

<style scoped>
/* -----------------------------
   大容器布局
   ----------------------------- */
.task-management-container {
  width: 99%;
  height: 99%;
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
  padding: 10px;
  width: 100%;
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
  gap: 20px;
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
  margin-left: 5px;
}

/* Tag 编辑/删除 选项 */
.tag-options {
  position: absolute;
  top: 30px;
  left: 0;
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
/* X 关闭按钮美化 */
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


/* -----------------------------
   通用
   ----------------------------- */
/* 分割线 */
.divider {
  border: none;
  height: 1px;
  background: #ddd;
  margin: 10px 0;
}


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
