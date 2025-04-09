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
          <div class="message-content" v-html="msg.html"></div>
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

        <!-- 按钮区 :disabled="!userQuestion.trim() || isLoading"-->
        <div class="button-area">
<!--          <el-button-->
<!--              class="search-button"-->
<!--              :class="{ 'active-search-button': isSearchActive }"-->
<!--              @click="toggleSearch"-->
<!--          >-->
<!--            🌐 Internet Search-->
<!--          </el-button>-->
          <el-tooltip
              placement="top"
              effect="dark"
          >
            <template #content>
              <div>
                <strong>Upload Attachment</strong><br />
                Supports PDF / PNG / JPG
              </div>
            </template>

            <el-upload
                ref="uploadRef"
                :auto-upload="false"
                :file-list="uploadFileList"
                accept=".pdf, .png, .jpg"
                :on-change="onFileChange"
                :on-remove="onFileRemove"
            >
              <el-button class="upload-button">
                <el-icon><UploadFilled /></el-icon>&nbsp;Upload File
              </el-button>
            </el-upload>
          </el-tooltip>

          <!-- 🡅 发送按钮：圆形按钮 + 向上箭头 :disabled="!userQuestion.trim()"  -->
          <el-button
              class="send-button"
              @click="sendQuestion"
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


</template>


<script setup>
import {nextTick, ref, watch} from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import {DocumentAdd, Loading, Promotion, Search, Top, UploadFilled} from "@element-plus/icons-vue";


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

import { ChatOpenAI } from "@langchain/openai"
// import { SerpAPI } from "@langchain/community/tools/serpapi";
import { TavilySearchResults } from "@langchain/community/tools/tavily_search"
import { createOpenAIFunctionsAgent, AgentExecutor } from "langchain/agents";
import {ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";

// import Tesseract from "tesseract.js"

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf"
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url"
import {marked} from "marked";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc


// 环境变量配置（需要创建.env.local文件）
// const GPT_API_BASE = import.meta.env.VITE_GPT_API_BASE
// const SERP_API_KEY = import.meta.env.VITE_SERP_API_KEY


const GPT_API_KEY = import.meta.env.VITE_GPT_API_KEY
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY
const VISION_API_KEY = import.meta.env.VITE_VISION_API_KEY


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
    html: marked.parse(text), // 使用 marked 转成 HTML
    timestamp: new Date().toLocaleTimeString()
  })
  scrollToBottom()
}


// 发送问题到 API
const sendQuestion = async () => {
  uploadFileList.value = []
  const questionText = userQuestion.value.trim()
  if (!questionText || isLoading.value) return

  isLoading.value = true
  userQuestion.value = ''
  addMessage('user', questionText)

  try {

    const model = new ChatOpenAI({
      temperature: 0.7,
      openAIApiKey: GPT_API_KEY,
      modelName: "gpt-4o"
    })

    const tools = [
      new TavilySearchResults({
        apiKey: TAVILY_API_KEY,
        name: "tavily_search",
        description: "Use this tool to search the internet for real-time information like weather, current events, or latest facts."
      })
    ]

    const recentMessages = messages.value.slice(-20) // 取最近20条
    const historyMessages = recentMessages.map(msg => {
      return msg.sender === "user"
          ? ["user", msg.text]
          : ["assistant", msg.text]
    })

    // Clean open {} in fileContent to avoid being identified as a variable
    const safeFileContent = fileContent.value.replace(/\{+/g, '[[').replace(/\}+/g, ']]')
    const systemIntro = fileContent.value
        ? `You are a helpful assistant. The user has uploaded one or more files, and their extracted text content is provided below. Use this extracted content to answer the user's question as accurately as possible. The files include PDFs and images that have been OCR processed. Be specific and refer to relevant sections:\n\n${safeFileContent}`
        : `You are a helpful assistant.`


    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemIntro],
      ...historyMessages,
      ["user", "{input}"],
      new MessagesPlaceholder("agent_scratchpad")
    ])

    const agent = await createOpenAIFunctionsAgent({ llm: model, tools, prompt })
    const executor = new AgentExecutor({ agent, tools, verbose: true })

    const result = await executor.invoke({ input: questionText })
    const answer = result.output || "No answer from the agent."
    addMessage("bot", answer)

  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message
    addMessage('bot', `Request failed: ${errorMsg}`)
    ElMessage.error(`Error: ${errorMsg}`)
  } finally {
    isLoading.value = false

    //  清除上传文件信息
    uploadedFiles.value = []
    fileContent.value = ""

    // 清空 el-upload 的文件列表
    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
  }
}

// 上传文件
const fileContent = ref("")
const uploadedFiles = ref([]) // 收集上传文件名
const uploadRef = ref(null)
const uploadFileList = ref([])


const onFileChange = async (uploadFile) => {
  console.log("File uploaded:", uploadFile)
  const file = uploadFile.raw
  uploadFileList.value.push(uploadFile)
  await handleFileUpload(file)
}

const onFileRemove = (file) => {
  console.log("File removed:", file)
  uploadedFiles.value = uploadedFiles.value.filter(f => f.name !== file.name)
  rebuildFileContent()
}


const handleFileUpload = async (file) => {
  let content = ""
  if (file.type === "application/pdf") {
    content = await extractPDF(file)
    // console.log("File content:", content)
  } else if (["image/png", "image/jpg"].includes(file.type)) {
    // content = await extractImage(file)
    content = await extractImageWithVisionAPI(file)
    // console.log("File content:", content)
  } else {
    ElMessage.error("Only PDF/PNG/JPG/JPEG files are supported")
    return
  }

  uploadedFiles.value.push({ name: file.name, content })
  console.log("uploadedFiles:", uploadedFiles.value)
  rebuildFileContent()
  ElMessage.success(`${file.name} loaded successfully!`)
}

const rebuildFileContent = () => {
  fileContent.value = uploadedFiles.value.map(f => `--- ${f.name} ---\n${f.content}`).join("\n\n")
}


const extractPDF = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result)
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise

      let fullText = ""

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)

        // 尝试获取文字内容
        const content = await page.getTextContent()
        const textItems = content.items.map((item) => item.str).filter(t => t.trim() !== "")
        let pageText = textItems.join(" ")

        // 如果页面没有文字，则渲染为图像并用 Vision OCR
        if (!pageText || pageText.length < 5) {
          const viewport = page.getViewport({ scale: 2.0 })
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")
          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({ canvasContext: context, viewport }).promise
          const dataUrl = canvas.toDataURL("image/png")

          // 转 base64 内容
          const base64 = dataUrl.replace(/^data:image\/(png|jpg);base64,/, "")
          const ocrResult = await fetch(
              `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  requests: [
                    {
                      image: { content: base64 },
                      features: [{ type: "TEXT_DETECTION" }]
                    }
                  ]
                })
              }
          )
          const ocrJson = await ocrResult.json()
          pageText = ocrJson.responses?.[0]?.fullTextAnnotation?.text || ''
        }

        fullText += `\n--- Page ${i} ---\n` + pageText
      }

      resolve(fullText)
    }

    reader.readAsArrayBuffer(file)
  })
}

// const extractImage = async (file) => {
//   const imageUrl = URL.createObjectURL(file)
//   const { data: { text } } = await Tesseract.recognize(imageUrl, 'eng')
//   return text
// }


const extractImageWithVisionAPI = async (file) => {
  const reader = new FileReader()

  return new Promise((resolve, reject) => {
    reader.onload = async () => {
      try {
        const base64String = btoa(
            new Uint8Array(reader.result)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )

        const response = await fetch(
            `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                requests: [
                  {
                    image: { content: base64String },
                    features: [{ type: "TEXT_DETECTION" }]
                  }
                ]
              })
            }
        )
        const result = await response.json()
        const text = result.responses?.[0]?.fullTextAnnotation?.text || ''
        resolve(text)
      } catch (err) {
        console.error("Google Vision OCR error:", err)
        reject(err)
      }
    }

    reader.readAsArrayBuffer(file)
  })
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
.upload-button {
  background-color: #FFFFFF;
  color: #E0E0E0;
  padding: 8px 16px !important;
  font-size: 16px !important;
  border: 1.5px solid #DCEDC8;
  border-radius: 50px !important;
  cursor: pointer !important;
  transition: all 0.4s ease-in-out !important;
}

.upload-button:hover {
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


</style>


