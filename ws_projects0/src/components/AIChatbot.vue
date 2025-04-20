<template>
  <el-drawer
      v-model="localVisible"
      direction="rtl"
      :size="drawerWidth + 'px'"
      :modal="false"
      :with-header="false"
      :append-to-body="false"
      class="drawer-container"
  >

    <div class="drawer-header">
      <span class="drawer-title">👋 Welcome, How can I help you today?</span>
      <el-button icon="Close" link @click="closeDrawer" />
    </div>

    <div class="drawer-body">
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

      <!-- Input area -->
      <div class="qa-input-bar">
        <el-input
            type="textarea"
            v-model="userQuestion"
            placeholder="Enter your question..."
            :disabled="isLoading"
            @keyup.enter.native="sendQuestion"
            class="input-area"
        />

        <div class="button-area">
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

          <el-button
              class="send-button"
              @click="sendQuestion"
          >
              <el-icon><Promotion /></el-icon>&nbsp;Send
          </el-button>
        </div>
      </div>
    </div>

    <div
        class="drawer-handle"
        @mousedown="onHandleMouseDown"
    >
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

const emits = defineEmits(['close', 'update:width'])

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


const drawerWidth = ref(400)

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


// ============================
// Question-and-answer related
// ============================
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


// Environment variable configuration (.env.local)
// const GPT_API_BASE = import.meta.env.VITE_GPT_API_BASE
// const SERP_API_KEY = import.meta.env.VITE_SERP_API_KEY
const GPT_API_KEY = import.meta.env.VITE_GPT_API_KEY
const TAVILY_API_KEY = import.meta.env.VITE_TAVILY_API_KEY
const VISION_API_KEY = import.meta.env.VITE_VISION_API_KEY


const userQuestion = ref('')
const messages = ref([])
const isLoading = ref(false)
const messagesContainer = ref(null)

// Automatically scroll to the bottom
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Message processing
const addMessage = (sender, text) => {
  messages.value.push({
    sender,
    text,
    html: marked.parse(text), // Use marked to convert to HTML
    timestamp: new Date().toLocaleTimeString()
  })
  scrollToBottom()
}


// Send the question to the API
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

    const recentMessages = messages.value.slice(-20) // Take the most recent 20 items
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

    //  Clear the information of the uploaded files
    uploadedFiles.value = []
    fileContent.value = ""

    if (uploadRef.value) {
      uploadRef.value.clearFiles()
    }
  }
}


const fileContent = ref("")
const uploadedFiles = ref([])
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

        const content = await page.getTextContent()
        const textItems = content.items.map((item) => item.str).filter(t => t.trim() !== "")
        let pageText = textItems.join(" ")

        // If there is no text on the page, render it as an image and use Vision OCR
        if (!pageText || pageText.length < 5) {
          const viewport = page.getViewport({ scale: 2.0 })
          const canvas = document.createElement("canvas")
          const context = canvas.getContext("2d")
          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({ canvasContext: context, viewport }).promise
          const dataUrl = canvas.toDataURL("image/png")

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
  height: 120px !important;
  border-radius: 12px;
  font-size: 15px;
  line-height: 1.5;
}


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


.send-button {
  background-color: #FFFFFF;
  color: #E0E0E0;
  padding: 8px 16px !important;
  font-size: 16px !important;
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
  height: calc(100% - 44px);
  overflow: auto;
}


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


.drawer-container {
  max-width: 100% !important;
  pointer-events: auto;
  position: fixed !important;
  z-index: 1000 !important;
  background-color: #F9FBF7 !important;
  border-left: 1px solid #ccc;

}


div[style*="position: fixed; inset: 0px"] {
  pointer-events: none !important;
  background: transparent !important;
}
div[style*="position: fixed; inset: 0px"] .el-drawer,
div[style*="position: fixed; inset: 0px"] .drawer-container {
  pointer-events: auto !important;
  z-index: 3000 !important;
}


.drawer-handle {
  position: absolute;
  top: 0;
  left: 0;
  width: 14px;
  height: 100%;
  cursor: e-resize;
  background-color: #f0f0f0;
  border-right: 1px solid #ddd;
  user-select: none;
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
  user-select: none;
}

</style>


