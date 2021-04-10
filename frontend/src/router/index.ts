import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Log from '../views/Log.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import About from '../views/About.vue';
import store from '../store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: {
      public: true,
      protected: false
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      public: false,
      protected: false
    }
  },
  {
    path: '/log',
    name: 'Log',
    component: Log,
    meta: {
      public: false,
      protected: true
    }
  },
  {
    path: '/about',
    name: 'About',
    meta: {
      public: true,
      protected: false
    },
    component: About
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.meta.protected && !store.state.loggedIn) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
