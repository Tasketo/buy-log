<template>
  <el-row type="flex" justify="center" style="margin-top: 5%;">
    <i style="font-size: 8rem;" class="el-icon-user-solid"></i>
  </el-row>
  <el-row type="flex" justify="center" style="margin-top: 1%;">
    <router-link to="/register" v-slot="{ navigate }" custom>
      <el-link type="primary" @click="navigate"> New user? Register now</el-link>
    </router-link>
  </el-row>
  <el-row type="flex" justify="center" style="margin-top: 1%;">
    <el-form
      v-loading="isLoading"
      ref="formRef"
      :rules="rules"
      :model="form"
      label-width="200px"
      label-position="top"
    >
      <el-form-item label="Username / email" prop="email">
        <el-input v-model="form.email" @keydown="onResetErrors" @keyup.enter="onSubmit"></el-input>
      </el-form-item>
      <el-form-item label="Password" prop="password">
        <el-input
          type="password"
          v-model="form.password"
          @keydown="onResetErrors"
          @keyup.enter="onSubmit"
        ></el-input>
      </el-form-item>

      <el-alert v-if="isError" title="Login failed. Try again" type="error" effect="dark" />

      <el-form-item style="margin-top: 2rem;">
        <el-button type="primary" @click="onSubmit">Login </el-button>
        <el-button @click="onReset">Reset</el-button>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Auth } from 'aws-amplify';
import { ElLoading } from 'element-plus';

import { LOG_IN } from '@/store';

export default defineComponent({
  name: 'Login',
  data: function() {
    return {
      isError: false,
      isLoading: false,
      form: {
        email: '',
        password: ''
      },
      rules: {
        email: [
          {
            required: true,
            message: 'Please input username or email',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please input password',
            trigger: 'blur'
          }
        ]
      }
    };
  },
  methods: {
    onReset() {
      // @ts-ignore
      this.$refs.formRef.resetFields();
    },
    onResetErrors() {
      this.isError = false;
    },
    async onSubmit() {
      try {
        // @ts-ignore
        await this.$refs.formRef.validate();
      } catch (e) {
        return;
      }
      this.isLoading = true;

      try {
        const user = await Auth.signIn(this.form.email, this.form.password);
        // @ts-ignore
        this.$store.commit(LOG_IN, user.username);
        this.$router.replace({ path: '/log' });
      } catch (error) {
        console.log('error signing in', error);
        this.isError = true;
      }
      this.isLoading = false;
    }
  },
  async mounted() {
    // @ts-ignore
    const loading = ElLoading.service({
      lock: true,
      spinner: 'el-icon-loading',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    try {
      const user = await Auth.currentAuthenticatedUser();
      loading.close();
      // @ts-ignore
      this.$store.commit(LOG_IN, user.username);
      this.$router.replace({ path: '/log' });
    } catch (e) {
      loading.close();
    }
  }
});
</script>
