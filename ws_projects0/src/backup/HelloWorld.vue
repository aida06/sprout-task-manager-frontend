<!-- 使用 Vue 3 的 <script setup> 语法糖，简化组件逻辑编写 -->
<script setup>
import { ref } from 'vue'
// 从 Vue 中导入 ref，用于定义响应式数据（实现数据的自动更新）

defineProps({
  msg: String,
  // 定义组件的 props，接收一个名为 msg 的字符串类型参数，用于从父组件传递数据
})

const count = ref(0)
// 定义响应式变量 count，初始值为 0
// 使用 ref 包裹数据，使得数据变化时会自动触发页面更新
</script>

<template>
  <!-- 模板部分，定义组件的结构和展示内容 -->

  <!-- 显示从父组件传入的 msg 数据 -->
  <h1>{{ msg }}</h1>

  <div class="card">
    <!-- 按钮，点击时触发事件：count++，实现计数器自增 -->
    <!-- @click 是 Vue 的事件绑定简写，相当于 v-on:click -->
    <button type="button" @click="count++">count is {{ count }}</button>
    <!-- 显示当前计数器的值 -->

    <p>
      Edit
      <code>components/HelloWorld.vue</code>
      <!-- 提示开发者可以编辑 HelloWorld.vue 文件来测试热模块替换 (HMR) -->
      to test HMR
    </p>
  </div>

  <p>
    Check out
    <!-- 链接到 Vue 官方的快速开始文档，target="_blank" 表示在新标签页打开 -->
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">
      create-vue
    </a>,
    the official Vue + Vite starter
  </p>

  <p>
    Learn more about IDE Support for Vue in the
    <!-- 链接到 Vue 的工具链文档，介绍 IDE 支持 -->
    <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank">
      Vue Docs Scaling up Guide
    </a>.
  </p>

  <!-- 提示用户可以点击 Vite 和 Vue 的 Logo 了解更多信息 -->
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
/* 局部样式，使用 scoped 属性确保样式只作用于当前组件 */

.read-the-docs {
  color: #888;  /* 设置文字颜色为浅灰色，通常用于提示信息 */
}
</style>

