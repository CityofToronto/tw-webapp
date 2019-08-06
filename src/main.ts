/* eslint linebreak-style: ["error", "windows"] */
import Vue from 'vue';
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

new Vue({
  render: h => h(App),
  store,
  router,
  vuetify,
}).$mount('#app');
