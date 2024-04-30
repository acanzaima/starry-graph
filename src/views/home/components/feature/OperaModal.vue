<script setup>
import { ref, watch, provide } from 'vue';
import { useCommonStore } from '@/stores/modules/common';
import { ElTooltip } from 'element-plus';
import AddForm from './OperaCom/AddForm.vue';
import EditForm from './OperaCom/EditForm.vue';
import RelationForm from './OperaCom/RelationForm.vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  /* 1 为新增节点 2为编辑节点 3为创建/编辑节点关系 */
  mode: {
    type: Number,
    default: 1
  }
});
const emits = defineEmits(['update:visible', 'reload']);

/* 公共store */
const commonStore = useCommonStore();

/** @功能 点击遮罩关闭操作弹框 */
function updateVisible() {
  // 关闭遮罩时判断是否需要重新渲染
  if (commonStore.needReDraw) {
    emits('reload');
    commonStore.setNeedReDraw(false);
  }
  emits('update:visible', false);
}

/** @功能 顶部tabs相关 */
const menuTabs = ref([
  { label: '新增节点', key: 1 },
  { label: '编辑节点', key: 2 },
  { label: '创建关系', key: 3 }
]);
const activeTab = ref(menuTabs.value[0]);
function updateActiveTab(t) {
  activeTab.value = t;
}

/** @功能 监听visible 赋值 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      activeTab.value = menuTabs.value.find((i) => i.key === props.mode);
    }
  }
);

/* 提交操作 */
const addPage = ref();
const editPage = ref();
const relationPage = ref();
function submitInfo() {
  if (activeTab.value.key === 1) {
    addPage.value.submit();
  }
  if (activeTab.value.key === 2) {
    editPage.value.submit();
  }
  if (activeTab.value.key === 3) {
    relationPage.value.submit();
  }
}

/* 注入激活key */
provide('activeTab', activeTab);
</script>

<template>
  <transition name="fade" mode="out-in" appear>
    <div class="opera-modal" aria-label="opera" v-show="visible" @click.stop="updateVisible">
      <transition name="slide-left" mode="out-in" appear>
        <div v-show="visible" class="modal-wrapper" @click.stop>
          <div class="modal-head">
            <div
              class="tab-item"
              v-for="m in menuTabs"
              :key="m.key"
              :class="{ 'is-active': m.key === activeTab.key }"
              @click="updateActiveTab(m)"
            >
              {{ m.label }}
              <el-tooltip
                v-if="m.key === 1 || m.key === 2"
                content="可使用alt键组合+/-快速增加或移除一条属性"
                placement="right-start"
                effect="light"
              >
                <el-icon><WarningFilled /></el-icon>
              </el-tooltip>
            </div>
          </div>
          <div class="modal-content">
            <add-form
              ref="addPage"
              class="base-form"
              :visible="visible"
              v-show="activeTab.key === 1"
            />
            <edit-form
              ref="editPage"
              class="base-form"
              :visible="visible"
              v-show="activeTab.key === 2"
            />
            <relation-form
              ref="relationPage"
              class="base-form"
              :visible="visible"
              v-show="activeTab.key === 3"
            />
          </div>
          <div class="modal-footer">
            <button class="footer-btn" @click.stop="updateVisible">取消</button>
            <button class="footer-btn" @click.stop="submitInfo">确定</button>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<style lang="less" scoped>
.opera-modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  overflow: auto;
  background: var(--color-background-opacity);
}
.modal-wrapper {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 1.875rem;
  top: 1.875rem;
  width: min(45%, 37.5rem);
  height: min(90%, 56.25rem);
  border-radius: 0.125rem;
  background: var(--color-background);
}
.modal-head {
  display: flex;
  padding: 0.625rem 0.3125rem;
  border-bottom: 0.0625rem solid var(--color-line);
}
.tab-item {
  padding: 0.3125rem 0.625rem;
  border-radius: 0.125rem;
  cursor: pointer;
  color: var(--color-text);
  transition: background-color var(--starry-sky-transition-time),
    font-weight var(--starry-sky-transition-time);
  &.is-active {
    font-weight: 700;
    background-color: var(--color-primary);
  }
}

.modal-content {
  flex: 1;
  padding: 0.625rem 0.3125rem;
  overflow: hidden;
  overflow-y: overlay;
}

.modal-footer {
  padding: 0.625rem 0.3125rem;
  border-top: 0.0625rem solid var(--color-line);
  text-align: right;
}
.footer-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1;
  height: 2rem;
  white-space: nowrap;
  cursor: pointer;
  color: var(--starry-sky-button-text-color);
  text-align: center;
  box-sizing: border-box;
  outline: none;
  transition: 0.1s;
  user-select: none;
  vertical-align: middle;
  -webkit-appearance: none;
  background-color: var(--color-primary);
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  padding: 0.5rem 0.9375rem;
  margin-left: 0.625rem;
}
</style>
