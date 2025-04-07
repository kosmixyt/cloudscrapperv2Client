import { createRouter, createWebHistory } from 'vue-router';
import routes from '../routes';

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Navigation guard to protect routes
router.beforeEach((to, from, next) => {
    const isAuthenticated = !!localStorage.getItem('token');

    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
        next('/login');
    } else {
        next();
    }
});

export default router;
