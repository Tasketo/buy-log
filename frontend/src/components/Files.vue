<template>
  <div style="padding:2rem;">
    <h3>Attachments of {{ entry ? entry.name : '' }}</h3>
    <ul v-if="entry.attachments">
      <li v-for="file in entry.attachments" :key="file">
        <a
          class="el-link el-link--primary is-underline"
          @click="onDownloadFile(file.key, file.name)"
        >
          <span class="el-link--inner">{{ file.name }}</span>
        </a>
        <el-popconfirm hideIcon title="Delete permanently?" @confirm="onDeleteFile(file.key)">
          <template #reference>
            <el-button
              style="margin-left:1rem;"
              size="small"
              icon="el-icon-delete"
              type="danger"
              circle
            />
          </template>
        </el-popconfirm>
      </li>
    </ul>
    <el-alert v-else title="No data" type="success" :closable="false">
      There are no files yet, start with uploading some
    </el-alert>

    <input type="file" @change="onFileAdded" style="margin-top: 2rem;" />
    <el-progress
      v-if="progress > 0"
      :text-inside="true"
      :stroke-width="26"
      :percentage="progress"
    ></el-progress>

    <el-alert v-if="isError" title="Failed. Try again" type="error" effect="dark" />
    <el-alert
      style="margin-top: 1rem;"
      v-if="duplicateName"
      :title="`Duplciate file name: ${duplicateName}`"
      type="warning"
      effect="dark"
    />
  </div>
</template>

<script lang="ts">
import { ref, PropType } from 'vue';
import Amplify, { API, Storage } from 'aws-amplify';
import { v4 as uuid } from 'uuid';

import { TItem, TAttachmentSubDocument } from '@/utils/types';

export default {
  props: {
    entry: {
      required: true,
      type: Object as PropType<TItem>
    }
  },
  emits: ['updated'],

  setup(props: { entry: TItem }, { emit }: { emit: (evt: string, value: TItem) => void }) {
    const isError = ref(false);
    const duplicateName = ref('');
    const progress = ref(0);

    const getFileKey = () => `${props.entry.itemId}/${uuid()}`;

    const updateEntry = async (entry: TItem) => {
      try {
        await API.put('buy-log', `items/${entry.itemId}`, {
          body: entry
        });
        emit('updated', entry);
      } catch (e) {
        console.error(e);
        isError.value = true;
      }
    };

    const onFileAdded = async (event: Event) => {
      if (!event.target) {
        return;
      }
      const target = event.target as HTMLInputElement;
      if (!target.files) {
        return;
      }
      const file = target.files[0];
      if (props.entry.attachments.find((x: TAttachmentSubDocument) => x.name === file.name)) {
        duplicateName.value = file.name;
        target.value = '';
        return;
      }

      try {
        const key = getFileKey();
        await Storage.put(key, file, {
          contentType: file.type,
          level: 'private',
          progressCallback(data: { loaded: number; total: number }) {
            progress.value = Math.round((data.loaded / data.total) * 100);
          }
        });
        const copy = JSON.parse(JSON.stringify(props.entry));
        if (!copy.attachments) {
          copy.attachments = [];
        }
        // @ts-ignore
        const identityId = Amplify.Credentials._identityId;
        const fullKey = `private/${identityId}/${key}`;
        // @ts-ignore
        const bucket = Storage._config.AWSS3.bucket;
        copy.attachments.push({ name: file.name, key, bucket, fullKey });
        await updateEntry(copy);
      } catch (err) {
        console.log('Error uploading file: ', err);
        isError.value = true;
      }
      progress.value = 0;
      target.value = '';
    };

    const onDownloadFile = async (key: string, name: string) => {
      try {
        const result = await Storage.get(key, {
          download: true,
          level: 'private'
        });
        // @ts-ignore
        const url = URL.createObjectURL(result.Body);
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        const clickHandler = () => {
          setTimeout(() => {
            URL.revokeObjectURL(url);
            a.removeEventListener('click', clickHandler);
          }, 150);
        };
        a.addEventListener('click', clickHandler, false);
        a.click();
      } catch (err) {
        console.log('Error downloading file: ', err);
        isError.value = true;
      }
    };

    const onDeleteFile = async (key: string) => {
      try {
        await Storage.remove(key, { level: 'private' });
        const copy = JSON.parse(JSON.stringify(props.entry));
        if (!copy.attachments) {
          copy.attachments = [];
        }
        copy.attachments.splice(
          copy.attachments.findIndex((x: TAttachmentSubDocument) => x.key === key),
          1
        );
        await updateEntry(copy);
      } catch (err) {
        console.log('Error deleting file: ', err);
        isError.value = true;
      }
    };

    return { duplicateName, isError, progress, onFileAdded, onDownloadFile, onDeleteFile };
  }
};
</script>
