<!-- 使用 <script setup> 语法糖来编写 Vue 3 组件的逻辑 -->
<script setup>
import HelloWorld from './components/HelloWorld.vue'
// 引入自定义组件 HelloWorld，路径指向 src/components 目录下的 HelloWorld.vue 文件
</script>

<template>
  <!-- 页面模板部分，定义了组件的结构 -->
  <div>
    <!-- 链接到 Vite 官网，点击会在新标签页打开 -->
    <a href="https://vite.dev" target="_blank">
      <!-- 显示 Vite 的 logo 图片，class="logo" 用于应用样式 -->
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>

    <!-- 链接到 Vue 官网，点击会在新标签页打开 -->
    <a href="https://vuejs.org/" target="_blank">
      <!-- 显示 Vue 的 logo 图片，使用相对路径 ./assets/vue.svg -->
      <!-- class="logo vue" 应用两个类，方便在样式中定义不同的 hover 效果 -->
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>

  <!-- 使用引入的 HelloWorld 组件，并传递名为 msg 的 prop，值为 "Vite + Vue" -->
  <HelloWorld msg="Vite + Vue" />
</template>

<style scoped>
/* 作用于当前组件的样式，scoped 表示样式只在本组件生效，避免全局污染 */

.logo {
  height: 6em;               /* 设置图片高度为 6 个字体大小单位（em） */
  padding: 1.5em;            /* 内边距为 1.5 个字体大小单位 */
  will-change: filter;       /* 提示浏览器提前优化 filter 属性，提升渲染性能 */
  transition: filter 300ms;  /* 设置滤镜效果的过渡动画，持续 300 毫秒 */
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
  /* 鼠标悬停时添加阴影效果，颜色为浅蓝色，制造发光的视觉效果 */
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
  /* 专门针对 Vue logo 的悬停效果，使用 Vue 的标志性绿色 (#42b883) */
}
</style>

