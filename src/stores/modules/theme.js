import { defineStore } from 'pinia';
// 主题相关
export const useThemeStore = defineStore({
  id: 'theme',
  state: () => ({
    // 主题
    theme: 'auto'
  }),
  actions: {
    setCurTheme(val) {
      this.theme = val;
    }
  }
});
