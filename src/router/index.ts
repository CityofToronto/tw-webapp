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

export const routes: RouteConfig[] = [
  {
    name: 'login',
    path: '/login',
    component: LoginPage,
    meta: {
      requiresAuth: false,
    },
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
        meta: {
          requiresProject: true,
        },
      },
      {
        path: '/assets/reconciliation',
        component: ReconciliationView,
        name: 'reconciliation',
        meta: {
          requiresProject: true,
        },
      },
      {
        path: '/assets/update',
        component: UpdateView,
        meta: {
          requiresProject: true,
        },
      },
      {
        path: '/admin/approval',
        component: ApprovalView,
        meta: {
          requiresProject: true,
        },
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
  const loggedIn = storeInstance.auth.loginStatus;
  const projectedNotSelected = !storeInstance.project.id;

  if ((to.meta.requiresAuth ?? true) && !loggedIn) {
    return next('/login');
  }
  if (to.meta.requiresProject && projectedNotSelected) {
    return next('/');
  }

  next();
});
