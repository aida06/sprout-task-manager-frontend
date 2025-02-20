import { createApp } from 'vue';
import { createPinia } from "pinia";
import App from './App.vue';
import router from './router';
// import './style.css';

const app = createApp(App);
app.use(createPinia());  // 先注册 Pinia
app.use(router);         // 再注册 Router
app.mount("#app");       // 最后挂载 Vue 实例




