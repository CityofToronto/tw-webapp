/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

import { createVuexStore } from 'vuex-simple';
import Store from './store';

Vue.use(Vuex);

export const storeInstance = new Store();

export default createVuexStore(storeInstance, {
  strict: false,
  modules: {},
  plugins: [],
});
