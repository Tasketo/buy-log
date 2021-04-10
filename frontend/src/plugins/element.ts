import {
  ElButton,
  ElFooter,
  ElHeader,
  ElMain,
  ElContainer,
  ElMenu,
  ElMenuItem,
  ElSubmenu,
  ElForm,
  ElFormItem,
  ElInput,
  ElRow,
  ElLink,
  ElPageHeader,
  ElAlert,
  ElInfiniteScroll,
  ElTable,
  ElTableColumn,
  ElDrawer,
  ElInputNumber,
  ElDatePicker,
  ElLoading,
  ElPopconfirm,
  ElNotification,
  ElProgress
} from 'element-plus';

/* eslint-disable */

export default (app: any): any => {
  app.use(ElButton);
  app.use(ElFooter);
  app.use(ElHeader);
  app.use(ElMain);
  app.use(ElContainer);
  app.use(ElMenu);
  app.use(ElMenuItem);
  app.use(ElSubmenu);
  app.use(ElForm);
  app.use(ElFormItem);
  app.use(ElInput);
  app.use(ElRow);
  app.use(ElLink);
  app.use(ElPageHeader);
  app.use(ElAlert);
  app.use(ElInfiniteScroll);
  app.use(ElTable);
  app.use(ElTableColumn);
  app.use(ElDrawer);
  app.use(ElInputNumber);
  app.use(ElDatePicker);
  app.use(ElLoading);
  app.use(ElPopconfirm);
  app.use(ElProgress);
  app.use(ElNotification);
}
