<template>
  <el-row class="comp-container" v-loading="isLoading">
    <div style="display: flex; justify-content: space-between">
      <div>
        <el-input
          @input="search"
          placeholder="Search"
          prefix-icon="el-icon-search"
          v-model="searchValue"
        />
      </div>
      <el-button
        id="create-btn"
        @click="entryDrawer = true"
        type="primary"
        style="margin-bottom: 1rem;"
      >
        Create entry
      </el-button>
    </div>

    <el-alert
      v-if="logs.length === 0 && !isLoading && !isFetching"
      title="No data"
      type="success"
      :closable="false"
    >
      There are no enties yet, start with creating some
    </el-alert>

    <div v-if="logs.length" class="infinite-list" v-infinite-scroll="load">
      <el-table :data="logs" style="width: 100%; overflow-x: auto;" ref="table">
        <el-table-column prop="date" label="Date" v-if="!isMobile">
          <template #default="scope">
            {{ $filters.formatDate(scope.row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="name" label="Name"> </el-table-column>
        <el-table-column prop="price" label="Price"> </el-table-column>
        <el-table-column prop="createdAt" label="Created at" v-if="!isMobile">
          <template #default="scope">
            {{ $filters.formatDate(scope.row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="Updated at" v-if="!isMobile">
          <template #default="scope">
            {{ $filters.formatDate(scope.row.updatedAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="attachments" label="Attachments">
          <template #default="scope">
            <div @click="openFiles(scope.row)" style="cursor: pointer;">
              {{
                scope.row.attachments.length
                  ? `${scope.row.attachments.length} file${
                      scope.row.attachments.length > 1 ? 's' : ''
                    }`
                  : 'none'
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="itemId" label="">
          <template #default="scope">
            <div :class="`btn-col${isMobile ? '-mobile' : ''}`">
              <div>
                <el-button icon="el-icon-edit" circle @click="onOpen(scope.row)" />
              </div>
              <div>
                <el-popconfirm hideIcon title="Delete permanently?" @confirm="onDelete(scope.row)">
                  <template #reference>
                    <el-button icon="el-icon-delete" type="danger" circle />
                  </template>
                </el-popconfirm>
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-alert v-if="isError" title="Error" type="error">
      Failed loading
    </el-alert>

    <el-drawer
      :size="`${isMobile ? '100%' : '30%'}`"
      v-model="entryDrawer"
      @close="$refs.entry.reset()"
    >
      <Entry ref="entry" @created="onNewEntry" @updated="onUpdatedEntry" />
    </el-drawer>

    <el-drawer :size="`${isMobile ? '100%' : '30%'}`" v-model="fileDrawer">
      <Files v-if="selectedItem" :entry="selectedItem" @updated="onUpdatedEntry" />
    </el-drawer>
  </el-row>
</template>

<script lang="ts">
import { API } from 'aws-amplify';
import { Component, defineComponent } from 'vue';
import { TItem } from '../utils/types';
import Entry from '../components/Entry.vue';
import Files from '../components/Files.vue';
import isMobile from '../utils/isMobile';

export default defineComponent({
  name: 'Log',
  components: { Entry, Files },
  data: () => ({
    searchValue: '',
    logs: [] as TItem[],
    selectedItem: null as TItem | null,
    lastKey: '',
    isLoading: true,
    isError: false,
    isFetching: false,
    entryDrawer: false,
    fileDrawer: false,
    hasMoreItems: true,
    searchTimeout: null as NodeJS.Timeout | null
  }),
  computed: {
    isMobile() {
      return isMobile();
    }
  },
  methods: {
    search() {
      if (this.searchTimeout) {
        clearTimeout(this.searchTimeout);
      }
      this.searchTimeout = setTimeout(() => {
        this.searchTimeout = null;
        this.logs.splice(0, this.logs.length);
        this.load(true);
      }, 250);
    },
    async onDelete(item: TItem) {
      const index = this.logs.findIndex(x => x.itemId === item.itemId);
      this.logs.splice(index, 1);
      try {
        await API.del('buy-log', `items/${item.itemId}`, {});
      } catch (e) {
        console.error(e);
        // @ts-ignore
        this.$notify({
          type: 'warning',
          title: 'Deleting failed',
          message: `Failed to delete entry ${item.name}. Try again`
        });
        this.logs.splice(index, 0, item);
      }
    },
    onOpen(item: TItem) {
      this.entryDrawer = true;
      this.$nextTick(() => {
        // @ts-ignore
        this.$refs.entry.initItem(item);
      });
    },
    openFiles(item: TItem) {
      this.fileDrawer = true;
      this.selectedItem = item;
    },
    onUpdatedEntry(item: TItem) {
      const index = this.logs.findIndex(x => x.itemId === item.itemId);
      this.logs.splice(index, 1, item);
      this.entryDrawer = false;
      if (this.selectedItem && this.selectedItem.itemId === item.itemId) {
        this.selectedItem = item;
      }
    },
    async load(forceLoad = false) {
      if (!forceLoad && (!this.hasMoreItems || this.isFetching)) {
        return;
      }
      this.isFetching = true;

      try {
        const data = await API.get('buy-log', 'items', {
          queryStringParameters: {
            limit: 25,
            pageItemId: this.lastKey || '',
            search: this.searchValue || '',
            field: 'name'
          }
        });
        this.logs.push(...data.data);
        if (data.meta.pageItemId) {
          this.lastKey = data.meta.pageItemId;
        }
        if (this.logs.length === data.meta.count) {
          this.hasMoreItems = false;
        }
        const table = this.$refs.table as Component | undefined;
        if (table) {
          // @ts-ignore
          table.$el.parentNode.scrollTop -= 5;
        }
      } catch (e) {
        console.log('fetch failed ', e);
        this.isError = true;
      } finally {
        this.isFetching = false;
      }
    },
    onNewEntry(entry: TItem) {
      this.logs.splice(0, 0, entry);
      this.entryDrawer = false;
      const ele = document.getElementById('create-btn');
      if (ele) {
        ele.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },
  async mounted() {
    this.isLoading = true;
    await this.load();
    this.isLoading = false;
  }
});
</script>

<style scoped>
.comp-container {
  flex-direction: column;
  flex: 1;
  white-space: nowrap;
  height: 100%;
}

.infinite-list {
  flex: 1;
  overflow: auto;
  height: 0;
}

.btn-col {
  display: flex;
  flex-direction: row;
}
.btn-col button {
  margin: 0 0.5rem;
}
.btn-col-mobile {
  display: flex;
  flex-direction: column;
}
</style>
