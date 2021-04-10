import { createStore } from 'vuex';

export const LOG_IN = 'LOG_IN';
export const LOG_OUT = 'LOG_OUT';

export default createStore({
  state: {
    loggedIn: false,
    username: null
  },
  mutations: {
    [LOG_IN](state, username) {
      state.loggedIn = true;
      state.username = username;
    },
    [LOG_OUT](state) {
      state.loggedIn = false;
      state.username = null;
    }
  },
  actions: {},
  modules: {}
});
