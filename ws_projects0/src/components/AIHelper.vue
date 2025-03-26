<template>
  <!-- 抽屉 -->
  <el-drawer
      v-model="localVisible"
      direction="rtl"
      :size="drawerWidth + 'px'"
      :modal="false"
      :with-header="false"
      :append-to-body="false"
      class="drawer-container"
  >
    <!-- 头部 -->
    <div class="drawer-header">
      <span class="drawer-title">👋 Welcome, How can I help you today?</span>
      <el-button icon="Close" link @click="closeDrawer" />
    </div>

    <!-- 主体内容 -->
    <div class="drawer-body">
      <!-- 对话区域 -->
      <div ref="messagesContainer" class="qa-conversation">
        <div v-for="(msg, index) in messages" :key="index"
             class="message" :class="msg.sender">
          <div class="message-content">{{ msg.text }}</div>
<!--          <div class="message-time">{{ msg.timestamp }}</div>-->
        </div>
        <div v-if="isLoading" class="loading-indicator">
          <el-icon class="is-loading"><Loading /></el-icon>
          &nbsp;Thinking...
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="qa-input-bar">
        <el-input
            type="textarea"
            v-model="userQuestion"
            placeholder="Enter your question..."
            :disabled="isLoading"
            @keyup.enter.native="sendQuestion"
            class="input-area"
        />

        <!-- 按钮区 -->
        <div class="button-area">
          <el-button
              class="search-button"
              @click="sendSearch"
              :disabled="!userQuestion.trim() || isLoading"
          >
            🌐 Internet Search
          </el-button>

          <!-- 🡅 发送按钮：圆形按钮 + 向上箭头 -->
          <el-button
              class="send-button"
              @click="sendQuestion"
              :disabled="!userQuestion.trim()"
          >
              <el-icon><Promotion /></el-icon>&nbsp;Send
          </el-button>
        </div>
      </div>
    </div>

    <!-- 把手：用户点击并拖拽它 -->
    <div
        class="drawer-handle"
        @mousedown="onHandleMouseDown"
    >
      <!-- 两条竖线图标，可以是图片/emoji -->
      <div class="handle-icon">
        ||
      </div>
    </div>
  </el-drawer>

  <!-- 幽灵线：拖拽时显示，用于给用户参考新的宽度 -->
<!--  <div-->
<!--      v-if="ghostVisible"-->
<!--      class="ghost-line"-->
<!--      :style="{ left: ghostX + 'px' }"-->
<!--  ></div>-->

</template>


<script setup>
import {nextTick, ref, watch} from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {Loading, Promotion, Search, Top} from "@element-plus/icons-vue";


const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// 新增自定义事件：'update:width'
const emits = defineEmits(['close', 'update:width'])

// 抽屉可见性
const localVisible = ref(props.visible)
watch(() => props.visible, (val) => {
  localVisible.value = val
})
watch(localVisible, (val) => {
  if (!val) emits('close')
})



function closeDrawer() {
  localVisible.value = false
}

// =========================
// 抽屉宽度
// =========================
const drawerWidth = ref(400)

// 拖拽相关
let isDragging = false
let startX = 0
let startWidth = 0

function onHandleMouseDown(e) {
  isDragging = true
  startX = e.clientX
  startWidth = drawerWidth.value

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)

  document.body.style.cursor = 'col-resize'
}

function onMouseMove(e) {
  if (!isDragging) return

  const delta = e.clientX - startX
  const newWidth = startWidth - delta
  drawerWidth.value = Math.max(newWidth, 200)

  // 实时通知父组件
  emits('update:width', drawerWidth.value)
}

function onMouseUp() {
  isDragging = false
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseup', onMouseUp)

  document.body.style.cursor = ''
}

// =========================
// 问答相关
// =========================
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { OpenAI } from "@langchain/openai";
import { SerpAPI } from "@langchain/community/tools/serpapi";


// 环境变量配置（需要创建.env.local文件）
const GPT_API_BASE = import.meta.env.VITE_GPT_API_BASE
const GPT_API_KEY = import.meta.env.VITE_GPT_API_KEY
const SERP_API_KEY = import.meta.env.VITE_SERP_API_KEY


const userQuestion = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)

// 自动滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 消息处理
const addMessage = (sender, text) => {
  messages.value.push({
    sender,
    text,
    timestamp: new Date().toLocaleTimeString()
  })
  scrollToBottom()
}

// 发送问题到 API
const sendQuestion = async () => {
  console.log('Environment variable：', {
    base: import.meta.env.VITE_GPT_API_BASE,
    key: import.meta.env.VITE_GPT_API_KEY
  })

  const questionText = userQuestion.value.trim()
  if (!questionText || isLoading.value) return

  try {
    isLoading.value = true
    userQuestion.value = ''
    addMessage('user', questionText)

    const response = await axios.post(
        `${GPT_API_BASE}/chat/completions`,
        {
          model: "gpt-4o-mini",  // 根据实际需要选择模型，如 "gpt-4o"
          messages: [{ role: "user", content: questionText }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GPT_API_KEY}`
          },
          timeout: 30000
        }
    )

    const answer = response.data.choices[0]?.message?.content || 'Have no answer'
    addMessage('bot', answer)

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message
    addMessage('bot', `Request failed: ${errorMsg}`)
    ElMessage.error(`APIRequest error: ${errorMsg}`)
  } finally {
    isLoading.value = false
  }
}


</script>



<style>

.loading-indicator {
  display: flex;
  align-items: center;
  padding: 10px;
  color: #666;
}


.qa-input-bar {
  display: flex;
  flex-direction: column;
  height: 120px !important;
  gap: 10px;
  padding: 24px 16px;
  margin-top: 30px !important;

}


.input-area {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.06);
}

:deep(.el-textarea__inner) {
  resize: none !important;
  height: 120px !important;  /* 控制输入框真实高度 */
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
}


/* 选中效果 */
:deep(.el-textarea__inner:focus) {
  border-color: #42b983 !important;
  box-shadow: 0 0 4px #42b98330;
}



.button-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  gap: 12px;
}

/* 联网搜索按钮 */
.search-button {
  background-color: #FFFFFF;
  color: #E0E0E0;
  padding: 8px 16px !important;
  font-size: 16px !important;
  border: 1.5px solid #DCEDC8;
  border-radius: 50px !important;
  cursor: pointer !important;
  transition: all 0.4s ease-in-out !important;
}

.search-button:hover {
  background-color: #F1F8E9 !important;
  border: 1px solid #C5E1A5 !important;
  color: #4E6B50 !important;
}

/* 发送按钮（圆形箭头） */
.send-button {
  background-color: #FFFFFF;
  color: #E0E0E0;
  padding: 8px 16px !important;
  font-size: 16px !important;  /* 强制放大图标 */
  border: 1.5px solid #DCEDC8;
  border-radius: 50px !important;
  cursor: pointer !important;
  transition: all 0.4s ease-in-out !important;
}

.send-button:hover {
  background-color: #F1F8E9 !important;
  border: 1px solid #C5E1A5 !important;
  color: #4E6B50 !important;
}


/* 头部 */
.drawer-header {
  font-size: 25px;
  background-color: transparent !important;
  color: #333;
  padding: 8px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-body {
  padding: 16px;
  height: calc(100% - 44px); /* 头部高度大约44px，留剩余 */
  overflow: auto;
}

/* ============================ */
/* 问答区样式 */
/* ============================ */
.qa-conversation {
  margin-top: 15px !important;
  height: 72%;
  overflow-y: auto;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 8px;
  padding: 5px 10px;
  border-radius: 5px;
  max-width: 80%;
  word-break: break-word;
}

.message.user {
  background-color: #F1F8E9;
  border: 0px solid #DCEDC8;
  text-align: right;
  margin-left: auto;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.11);
}

.message.bot {
  background-color: #F1F0F0;
  border: 0px solid #E0E0E0;
  text-align: left;
  margin-right: auto;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.11);
}

.qa-input {
  display: flex;
  gap: 10px;
  align-items: center;
}



/* 抽屉整体容器 */
.drawer-container {
  max-width: 100% !important;
  pointer-events: auto;
  position: fixed !important;
  z-index: 1000 !important;
  background-color: #F9FBF7 !important;
  border-left: 1px solid #ccc;

}


/* 注意：要写在全局css，或者用 :deep() */
div[style*="position: fixed; inset: 0px"] {
  pointer-events: none !important;
  background: transparent !important;
}
div[style*="position: fixed; inset: 0px"] .el-drawer,
div[style*="position: fixed; inset: 0px"] .drawer-container {
  pointer-events: auto !important;
  z-index: 3000 !important;
}


/* 把手：放在抽屉左侧，显示两条竖线 */
.drawer-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 14px;
  height: 100%;
  cursor: e-resize;
  background-color: #f0f0f0; /* 或透明 */
  border-right: 1px solid #ddd;

  /* 关键：防止选中文字 */
  user-select: none;

  /* 可选：让鼠标点住后不能双击选中 */
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  display: flex;
  align-items: center;
  justify-content: center;

}

.handle-icon {
  font-size: 17px;
  color: #BDBDBD;

  /* 同样防止选中文字 */
  user-select: none;
}


/* 幽灵线：拖拽时显示，跟随鼠标 */
.ghost-line {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: rgba(0, 0, 0, 0);
  cursor: e-resize;
  z-index: 10;
}




</style>


