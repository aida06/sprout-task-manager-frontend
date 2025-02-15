import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Signup from '../components/Signup.vue';
import Home from '../components/Home.vue';
import VirtualStore from '../components/VirtualStore.vue';
import FocusTimer from '../components/FocusTimer.vue';
import Calendar from '../components/Calendar.vue';
import DataDashboard from '../components/DataDashboard.vue';

const routes = [
    { path: '/', component: Login },
    { path: '/signup', component: Signup },
    { path: '/home', component: Home },
    { path: '/virtual-store', component: VirtualStore },
    { path: '/focus-timer', component: FocusTimer },
    { path: '/calendar', component: Calendar },
    { path: '/data-dashboard', component: DataDashboard }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

