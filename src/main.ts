import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import routes from './routes';

const app = createApp(App);
const router = createRouter({
    history: createWebHistory(),
    routes
});

app.use(router);
app.mount('#app');
declare module '*.vue' {
    import { DefineComponent } from 'vue';
    const component: DefineComponent<{}, {}, any>;
    export default component;
}