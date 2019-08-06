/* eslint-disable no-param-reassign, no-shadow */
// This file extends snackbars from the vuetify library
// https://vuetifyjs.com/en/components/snackbars
const initialState = () => ({
  visible: false,
  message: '',
  code: 0,
  color: '',
  top: true,
  bottom: false,
  left: false,
  right: false,
});

const getters = {
  getNotification: ({
    visible, message, color, top, bottom, left, right,
  }) => ({
    visible,
    message,
    color,
    top,
    bottom,
    left,
    right,
  }),
};

const mutations = {
  setNotification(state, { message, color, position }) {
    state.visible = true;
    state.message = message;
    state.color = color;
    state.position = position;
  },
  clearNotification(state) {
    const s = initialState();
    Object.keys(s).forEach(key => {
      state[key] = s[key];
    });
  },
};

const actions = {
  setNotification({ commit }, errorMessage) {
    commit('setNotification', errorMessage);
  },
  clearNotification({ commit }) {
    commit('clearNotification');
  },
};

export default {
  namespaced: true,
  state: initialState,
  getters,
  actions,
  mutations,
};
