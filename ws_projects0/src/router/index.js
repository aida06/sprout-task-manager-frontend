import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Signup from '../components/Signup.vue';
import TaskManagement from '../components/TaskManagement.vue';
import SproutIsland from '../components/SproutIsland.vue';
import FocusTimer from '../components/FocusTimer.vue';
import Schedule from '../components/Schedule.vue';
import DataDashboard from '../components/DataDashboard.vue';
import Badges from "../components/Badges.vue";
import Help from '../components/Help.vue';

const routes = [
    { path: '/', component: Login },
    { path: '/signup', component: Signup },
    { path: '/task-management', component: TaskManagement },
    { path: '/sprout-island', component: SproutIsland },
    { path: '/focus-timer', component: FocusTimer },
    { path: '/schedule', component: Schedule },
    { path: '/data-dashboard', component: DataDashboard },
    { path: '/badges', component: Badges },
    { path: '/help', component: Help }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;

