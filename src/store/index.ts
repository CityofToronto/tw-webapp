/* eslint-disable no-param-reassign */
import Vue from 'vue';
import Vuex from 'vuex';

import notification from './modules/notification';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: { notification },
  state: {
    table: {
      name: 'activity',
      id: 45,
    },
  },
  getters: {
    getRowId: state => state.table.id,
    getTableName: state => state.table.name,
  },
  mutations: {
    setTableData(state, { tableName, id }) {
      state.table.name = tableName;
      state.table.id = id;
    },
  },
  actions: {
    setTableData({ commit }, { tableName, id }) {
      commit('setTableData', {
        tableName,
        id,
      });
    },
  },
});
