import Vue from 'vue';
import VueRouter from 'vue-router';
import Reviewer from '@/views/Reviewer.vue';
import Home from '@/views/Home.vue';
import TreePage from '@/views/TreePage.vue';

Vue.use(VueRouter);

const routes = [
  {
    path: '/review/:table',
    component: Reviewer,
  },
  {
    path: '*',
    component: Home,
  },
  {
    path: '/test',
    component: TreePage,
  },
];

export default new VueRouter({
  routes,
  mode: 'history',
});
