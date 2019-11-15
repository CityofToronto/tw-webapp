import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import HomePage from '@/views/HomePage.vue';
import LoginPage from '@/views/authPages/LoginPage.vue';
import ReconciliationView from '@/views/assetView/ReconciliationView.vue';
import ReservationView from '@/views/assetView/ReservationView.vue';
import UpdateView from '@/views/assetView/UpdateView.vue';
import ApprovalView from '@/views/assetView/ApprovalView.vue';
import MainApp from '@/views/MainApp.vue';
import { storeInstance } from '@/store';

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    name: 'login',
    path: '/login',
    component: LoginPage,
  },
  {
    path: '/',
    component: MainApp,
    children: [
      {
        name: 'home',
        path: '/',
        component: HomePage,
      },
      {
        path: '/assets/reservation',
        component: ReservationView,
        name: 'reservation',
      },
      {
        path: '/assets/reconciliation',
        component: ReconciliationView,
        name: 'reconciliation',
      },
      {
        path: '/assets/update',
        component: UpdateView,
      },
      {
        path: '/admin/approval',
        component: ApprovalView,
      },
      {
        path: '*',
        redirect: '/',
      },
    ],
  },
];

export const router = new VueRouter({
  routes,
  mode: 'history',
});

router.beforeEach((to, from, next) => {
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = storeInstance.auth.loginStatus;

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
});
