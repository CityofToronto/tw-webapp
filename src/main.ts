import Vue, { VNode } from 'vue';
import Vuetify from 'vuetify';
// import Notifications from 'vue-notification';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import 'ag-grid-enterprise';

import 'vuetify/dist/vuetify.min.css';
import App from './App.vue';
import store from './store';
import { router } from './router';

Vue.config.productionTip = false;

Vue.use(Vuetify);
Vue.use(Toast);

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});

/** This define a global filter that formats a string to have a capital first letter
 * These should be used sparingly as they are hard to track */
Vue.filter('capitalize', (value: string): string =>
  value
    .toLowerCase()
    .split(' ')
    .map((s): string => s.charAt(0).toUpperCase() + s.substring(1))
    .join(' '),
);

new Vue({
  render: (h): VNode => h(App),
  store,
  router,
  vuetify,
}).$mount('#app');
