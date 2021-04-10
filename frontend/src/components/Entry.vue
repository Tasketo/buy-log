<template>
  <el-form
    ref="form"
    v-loading="isLoading"
    :rules="rules"
    :model="form"
    label-width="200px"
    label-position="top"
    style="padding: 4rem;"
  >
    <el-form-item label="Name" prop="name">
      <el-input v-model="form.name"></el-input>
    </el-form-item>
    <el-form-item label="Price" prop="price">
      <el-input-number v-model="form.price"></el-input-number>
    </el-form-item>
    <el-form-item label="Date" prop="date">
      <el-date-picker v-model="form.date" type="date" format="DD.MM.YYYY"> </el-date-picker>
    </el-form-item>

    <el-alert v-if="isError" title="Error" type="error">
      Failed {{ isUpdateMode ? 'update' : 'creation' }}!
    </el-alert>

    <el-form-item style="margin-top: 4rem;">
      <el-row style="justify-content: center;">
        <el-button v-if="isUpdateMode" type="primary" @click="onSubmit">Update</el-button>
        <el-button v-else type="primary" @click="onSubmit">Create</el-button>
      </el-row>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { API } from 'aws-amplify';
import { TItem } from '@/utils/types';

const getInitData = () => ({
  itemId: null as string | null,
  name: '',
  date: new Date(),
  price: 0,
  attachments: []
});

export default defineComponent({
  name: 'Entry',
  data: () => ({
    isError: false,
    isLoading: false,
    form: getInitData(),
    rules: {
      name: [
        {
          required: true,
          message: 'Please input name',
          trigger: 'blur'
        }
      ],
      date: [
        {
          type: 'date',
          required: true,
          message: 'Please input date',
          trigger: 'blur'
        }
      ],
      price: [
        {
          type: 'number',
          required: true,
          message: 'Please input price',
          trigger: 'blur'
        },
        {
          validator: (_: unknown, value: string, callback: Function) => {
            if (parseFloat(value) > 0) {
              callback();
            } else {
              callback(new Error('Please input price'));
            }
          },
          trigger: 'blur'
        }
      ]
    }
  }),
  computed: {
    isUpdateMode(): boolean {
      // @ts-ignore
      return this.form.itemId !== null;
    }
  },
  methods: {
    reset() {
      this.isError = false;
      this.form = getInitData();
    },

    initItem(newVal: TItem) {
      this.form = JSON.parse(JSON.stringify(newVal));
    },

    async onSubmit() {
      this.isError = false;
      try {
        // @ts-ignore
        await this.$refs.form.validate();
      } catch (e) {
        return;
      }

      this.isLoading = true;
      if (this.isUpdateMode) {
        await this.update();
      } else {
        await this.create();
      }
      this.isLoading = false;
    },

    async create() {
      try {
        const data = await API.post('buy-log', 'items', {
          body: { ...this.form }
        });
        this.$emit('created', data);
        this.reset();
      } catch (e) {
        console.error(e);
        this.isError = true;
      }
    },

    async update() {
      try {
        await API.put('buy-log', `items/${this.form.itemId}`, {
          body: { ...this.form }
        });
        this.$emit('updated', this.form);
        this.reset();
      } catch (e) {
        console.error(e);
        this.isError = true;
      }
    }
  }
});
</script>

<style scoped>
>>> .el-input-number,
>>> .el-date-editor.el-input {
  width: 100%;
}
</style>
