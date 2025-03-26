import { createApp } from 'vue';
import { createPinia } from "pinia";
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './style.css' // 导入全局样式


const app = createApp(App);

app.use(createPinia());
app.use(router);

// 注册 Element Plus
app.use(ElementPlus);

// 最后挂载
app.mount("#app");






