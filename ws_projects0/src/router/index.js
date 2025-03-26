import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Signup from '../components/Signup.vue';
import Home from '../components/Home.vue';
import SproutIsland from '../components/SproutIsland.vue';
import FocusTimer from '../components/FocusTimer.vue';
import Schedule from '../components/Schedule.vue';
import DataDashboard from '../components/DataDashboard.vue';

const routes = [
    { path: '/', component: Login },
    { path: '/signup', component: Signup },
    { path: '/home', component: Home },
    { path: '/sprout-island', component: SproutIsland },
    { path: '/focus-timer', component: FocusTimer },
    { path: '/schedule', component: Schedule },
    { path: '/data-dashboard', component: DataDashboard }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

