<template>
  <el-menu :router="true" :default-active="$route.path" mode="horizontal">
    <template v-for="rule in visiblieRoutes">
      <el-submenu
        v-if="rule.children && rule.children.length > 0"
        :index="rule.path"
        :key="rule.path"
      >
        <template v-slot:title><i :class="rule.icon"></i>{{ rule.name }}</template>
        <el-menu-item
          v-for="child in rule.children"
          :index="rule.path + '/' + child.path"
          :key="rule.path + '/' + child.path"
          >{{ child.title }}</el-menu-item
        >
      </el-submenu>
      <el-menu-item v-else :index="rule.path" :key="rule.path">
        <i :class="rule.icon"></i>
        {{ rule.name }}
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script lang="ts">
import { computed } from 'vue';
import { useStore } from 'vuex';
import { RouteRecordRaw, useRouter } from 'vue-router';

export default {
  setup() {
    const store = useStore();
    const router = useRouter();

    const visiblieRoutes = computed(() => {
      if (store.state.loggedIn) {
        return router.options.routes.filter((x: RouteRecordRaw) => x.meta && x.meta.protected);
      }
      return router.options.routes.filter((x: RouteRecordRaw) => x.meta && x.meta.public);
    });

    return { visiblieRoutes };
  }
};
</script>
