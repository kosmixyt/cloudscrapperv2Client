import { RouteRecordRaw } from 'vue-router';
import Home from './views/Home.vue';
import About from './views/About.vue';
import Login from './views/LoginRegister.vue';
import Dashboard from './views/Dashboard.vue';
import ApiRequest from './views/ApiRequest.vue'; // Add import for the new component

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/about',
        name: 'About',
        component: About
    },
    {
        path: '/login',
        name: 'Login',
        component: Login
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: { requiresAuth: true }
    },
    {
        path: '/api-request',
        name: 'ApiRequest',
        component: ApiRequest,
        meta: { requiresAuth: true }  // Add our new route with auth protection
    }
];

export default routes;