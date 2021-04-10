<template>
  <el-page-header @back="goBack" content="Register" />
  <el-row type="flex" justify="center" style="margin-top: 5%; font-size: 8rem;">
    <i class="el-icon-user"></i>
  </el-row>
  <el-row type="flex" justify="center">
    <el-form
      v-if="isRequestCode"
      ref="formRefConfirmCode"
      :rules="rules"
      :model="form"
      label-width="200px"
      label-position="top"
    >
      <el-alert
        style="margin-top: 2%"
        show-icon
        :closable="false"
        title="Please check you emails and enter the verfication code"
        type="success"
      >
      </el-alert>

      <el-form-item label="Code" prop="code">
        <el-input
          v-model="formCode.code"
          @keydown="onResetErrors"
          v-on:keyup.enter="onConfirm"
        ></el-input>
      </el-form-item>

      <el-form-item style="margin-top: 4rem;">
        <el-button type="primary" @click="onConfirm">Confirm</el-button>
      </el-form-item>
    </el-form>
    <el-form
      v-else
      ref="formRefRegister"
      :rules="rules"
      :model="form"
      label-width="200px"
      label-position="top"
    >
      <el-form-item label="Email" prop="email">
        <el-input v-model="form.email" @keydown="onResetErrors"></el-input>
      </el-form-item>
      <el-form-item label="Username" prop="username">
        <el-input v-model="form.username" @keydown="onResetErrors"></el-input>

        <el-alert
          v-if="isDuplicateUsername"
          title="This username is already in use. Choose another one"
          type="warning"
          effect="dark"
        />
      </el-form-item>

      <el-alert
        show-icon
        :closable="false"
        title="Passwort must have at least length of 16 and requires a digits, lowercase- and uppercase characters"
        type="info"
      >
      </el-alert>

      <el-form-item label="Password" prop="password">
        <el-input
          type="password"
          v-model="form.password"
          @keydown="onResetErrors"
          v-on:keyup.enter="onSubmit"
        ></el-input>
      </el-form-item>

      <el-alert v-if="isError" title="Registration failed. Try again" type="error" effect="dark" />

      <el-form-item style="margin-top: 4rem;">
        <el-button type="primary" @click="onSubmit">Register</el-button>
        <el-button @click="onReset">Reset</el-button>
      </el-form-item>
    </el-form>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Auth } from 'aws-amplify';
import { LOG_IN } from '@/store';

export default defineComponent({
  name: 'Register',
  data: function() {
    return {
      isError: false,
      isRequestCode: false,
      isDuplicateUsername: false,
      formCode: {
        code: ''
      },
      rulesCode: {
        code: [{ required: true, trigger: 'blur' }]
      },
      form: {
        email: '',
        username: '',
        password: ''
      },
      rules: {
        email: [
          {
            required: true,
            regex: '/^S+@S+.S+$/',
            message: 'Please input email',
            trigger: 'blur'
          }
        ],
        username: [
          {
            required: true,
            message: 'Please input username',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: 'Please input password',
            trigger: 'blur'
          },
          {
            required: true,
            message: 'Length must be at least 16 characters',
            trigger: 'blur',
            min: 16
          },
          {
            validator: (_: unknown, value: string, callback: Function) => {
              if (value === '') {
                callback(); // covered above
              } else if (!value.match(/\d/)) {
                callback(new Error('Passwort must contain a number'));
              } else if (!value.match(/[a-z]/)) {
                callback(new Error('Passwort must contain a lowercase character'));
              } else if (!value.match(/[A-Z]/)) {
                callback(new Error('Passwort must contain a uppercase character'));
              } else {
                callback();
              }
            },
            trigger: 'blur'
          }
        ]
      }
    };
  },
  methods: {
    onReset() {
      // @ts-ignore
      this.$refs.formRefRegister.resetFields();
    },
    async onSubmit() {
      try {
        // @ts-ignore
        await this.$refs.formRefRegister.validate();
      } catch (e) {
        return;
      }
      this.register();
    },
    goBack() {
      this.$router.replace({ name: 'Login' });
    },
    async register() {
      try {
        const { user } = await Auth.signUp({
          username: this.form.username.trim(),
          password: this.form.password,
          attributes: {
            email: this.form.email
          }
        });
        // @ts-ignore
        if (user.authenticationFlowType === 'USER_SRP_AUTH') {
          this.isRequestCode = true;
        } else {
          this.isError = true;
        }
      } catch (error) {
        console.log('error signing up:', error);
        if (error.code === 'UsernameExistsException') {
          this.isDuplicateUsername = true;
        } else {
          this.isError = true;
        }
      }
    },
    async onConfirm() {
      try {
        // @ts-ignore
        await Auth.confirmSignUp(this.form.username.trim(), this.formCode.code.trim());

        const user = await Auth.signIn(this.form.username.trim(), this.form.password);
        // @ts-ignore
        this.$store.commit(LOG_IN, user.username);
        this.$router.replace({ path: '/log' });
      } catch (error) {
        console.log('error confirm:', error);
        this.isError = true;
      }
    },
    onResetErrors() {
      this.isError = false;
      this.isDuplicateUsername = false;
    }
  }
});
</script>
