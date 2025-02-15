// 从 Vue 库中导入 createApp 函数，用于创建 Vue 应用实例
import { createApp } from 'vue'

// 导入全局样式文件 style.css，应用于整个项目
import './style.css'
// 该样式文件会影响所有组件，通常用于定义全局的基础样式、布局等

// 导入根组件 App.vue，这是应用的主组件，所有页面内容都会渲染在这个组件中
import App from './App.vue'

// 创建 Vue 应用实例，并将 App 组件挂载到 index.html 中的 #app 元素上
createApp(App).mount('#app')
// - createApp(App)：创建一个新的 Vue 应用实例，指定根组件为 App
// - mount('#app')：将应用挂载到 DOM 中 id 为 "app" 的元素上
//   这对应于 index.html 文件中的 <div id="app"></div>

// 这样，Vue 就会接管 #app 元素，渲染 App 组件及其子组件

