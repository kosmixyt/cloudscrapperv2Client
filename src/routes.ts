import { RouteRecordRaw } from "vue-router";
import Home from "./views/Home.vue";
import Login from "./views/LoginRegister.vue";
import Dashboard from "./views/Dashboard.vue";
import ApiRequest from "./views/ApiRequest.vue"; // Add import for the new component
import Account from "./views/Account.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/account",
    name: "Account",
    component: Account,
    meta: { requiresAuth: true },
  },
  {
    path: "/api-request",
    name: "ApiRequest",
    component: ApiRequest,
    meta: { requiresAuth: true }, // Add our new route with auth protection
  },
];

export default routes;
