import { createApp } from 'vue';
import stores from './stores';

import App from './App.vue';
import router from './router';
import './styles/main.less';
import ToolWrapper from '@/components/ToolWrapper.vue';

import 'element-plus/theme-chalk/dark/css-vars.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';

const app = createApp(App);

app.use(stores);
app.use(router);

app.component('ToolWrapper', ToolWrapper);

app.component('ElIcon', ElIcon);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount('#app');
