/* eslint linebreak-style: ["error", "windows"] */
import Vue, { VNode } from 'vue';
import Vuetify from 'vuetify';
import Vuelidate from 'vuelidate';
import 'ag-grid-enterprise';

import 'vuetify/dist/vuetify.min.css';
import App from './App.vue';
import store from './store';
import router from './router';

Vue.config.productionTip = false;

Vue.use(Vuetify);
Vue.use(Vuelidate);

const vuetify = new Vuetify({
  icons: {
    iconfont: 'mdi',
  },
});

/** This define a global filter that formats a string to have a capital first letter
 * These should be used sparingly as they are hard to track */
Vue.filter('capitalize', (value: string): string => {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
});

new Vue({
  render: (h): VNode => h(App),
  store,
  router,
  vuetify,
}).$mount('#app');
