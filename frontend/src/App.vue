<template>
  <el-container>
    <el-main> <router-view /></el-main>
    <el-footer>
      <div class="footer">
        <router-link to="/about" v-slot="{ navigate }" custom>
          <el-link :underline="false" type="primary" @click="navigate">About</el-link>
        </router-link>
        <template v-if="$store.state.loggedIn">
          <el-link :underline="false" type="primary" @click="logout">Sign out</el-link>
        </template>
      </div>
    </el-footer>
  </el-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// import Navigation from './components/Navigation.vue';
import { Auth } from 'aws-amplify';
import { LOG_OUT } from './store';

export default defineComponent({
  name: 'App',
  components: {
    // Navigation
  },
  methods: {
    logout() {
      Auth.signOut();
      // @ts-ignore
      this.$store.commit(LOG_OUT);
      this.$router.push({ path: '/' });
    }
  }
});
</script>

<style>
html,
body {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  margin: 0;
}
body {
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

#app,
section {
  overflow: auto;
  flex: 1;
  flex-direction: column;
  display: flex;
}

.logout-btn {
  position: absolute;
  top: 10px;
  right: 20px;
}

.footer {
  display: flex;
  justify-content: center;
  align-content: center;
  margin-top: 1rem;
}

.footer .el-link {
  margin: 0 1rem;
}
</style>
