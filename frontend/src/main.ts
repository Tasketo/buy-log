import { createApp } from 'vue';
import Amplify, { Auth } from 'aws-amplify';

import App from './App.vue';
import router from './router';
import store from './store';
import installElementPlus from './plugins/element';
import awsConfig from './aws-references.json';

import 'element-plus/lib/theme-chalk/index.css';

// @ts-ignore log lvl for amplify
// window.LOG_LEVEL = 'DEBUG';

Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: awsConfig['region'], //'eu-central-1',
    userPoolId: awsConfig['buy-log-user-pool-id'], //'eu-central-1_ipSklrhZn',
    userPoolWebClientId: awsConfig['buy-log-user-pool-client-id'], //'40vpj4hf0j5f3lm6qd5n7gi4d7',
    identityPoolId: awsConfig['buy-log-identity-pool-id'] //'eu-central-1:9f54f207-4f6c-4352-96c4-998574611124'
  },
  API: {
    endpoints: [
      {
        name: 'buy-log',
        endpoint: awsConfig['buy-log-items-endpoint'], //'https://ujlaj9op57.execute-api.eu-central-1.amazonaws.com/prod/',
        /* eslint-disable-next-line @typescript-eslint/camelcase */
        custom_header: async () => {
          return {
            Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`
          };
        }
      }
    ]
  },
  Analytics: {
    disabled: true
  },
  Storage: {
    AWSS3: {
      bucket: awsConfig['buy-log-attachment-bucket'], //'backend-attachments23cbb7c9-86fnlg65fr2h',
      region: awsConfig['region'] //'eu-central-1'
    }
  }
});

const app = createApp(App);
app.config.globalProperties.$filters = {
  formatDate(value: string | null | undefined) {
    if (!value) {
      return '';
    }
    return new Date(value).toLocaleString();
  }
};

installElementPlus(app);

app
  .use(store)
  .use(router)
  .mount('#app');
