import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import LoginPage from '@/views/LoginPage.vue';
import ReconciliationView from '@/views/ReconciliationView.vue';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: '/',
    component: HomePage,
  },
  {
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/reconciliation',
    component: ReconciliationView,
  },
  {
    path: '*',
    redirect: '/',
  },
];

export const router = new VueRouter({
  routes,
  mode: 'history',
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
});
