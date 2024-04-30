import { defineStore } from 'pinia';
// 
export const useCommonStore = defineStore({
  id: 'common',
  state: () => ({
    // 标签列表
    dictLabels: [],
    // 属性列表
    dictAttrs: [],
    // 关系列表
    dictRelations: [],
    // 是否需要重新请求渲染视图
    needReDraw: false
  }),
  actions: {
    setDictLabels(val) {
      this.dictLabels = val;
    },
    setDictAttrs(val) {
      this.dictAttrs = val;
    },
    setAictRelations(val) {
      this.dictRelations = val;
    },
    setNeedReDraw(val) {
      this.needReDraw = val;
    }
  }
});
