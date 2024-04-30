<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { ElSelect, ElOption } from 'element-plus';
import { useCommonStore } from '@/stores/modules/common';
import { SYSTEM_NODE_NAME } from '@/config/setting';

/* props */
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  value: {
    type: String,
    default: ''
  },
  labels: {
    type: Array,
    default: () => []
  },
  attr: {
    type: [String, null],
    default: null
  }
});
const emits = defineEmits(['update:labels', 'update:attr', 'update:value', 'search']);

/* 公共store */
const commonStore = useCommonStore();

/* 补充固定类型 */
const useDictAttrs = computed(() => {
  return [{ label: '节点显示名称', value: SYSTEM_NODE_NAME }, ...commonStore.dictAttrs];
});

/* 设置input状态 */
const inputFocus = ref(false);
watch(
  () => props.visible,
  (val) => {
    if (!val) {
      inputFocus.value = false;
    }
  }
);

// 重置搜索
function resetSearch() {
  emits('update:labels', []);
  emits('update:attr', null);
  emits('update:value', null);
  emits('search');
}

/* 监听enter案件 */
onMounted(() => {
  document.addEventListener('keydown', triggerSearch);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', triggerSearch);
});

function triggerSearch(event) {
  if (props.visible && (event.key === 'Enter' || event.code === 'Enter' || event.keyCode === 13)) {
    emits('search');
  }
}
</script>

<template>
  <div class="search-wrapper">
    <transition name="top-fade" mode="out-in" appear>
      <div class="input-wrapper" v-if="visible">
        <el-select
          class="label-select"
          :model-value="labels"
          clearable
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="标签"
          @update:model-value="$emit('update:labels', $event)"
        >
          <el-option
            v-for="item in commonStore.dictLabels"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        /></el-select>
        <el-select
          class="attr-select"
          :model-value="attr"
          clearable
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="查询类型"
          @update:model-value="$emit('update:attr', $event)"
        >
          <el-option
            v-for="item in useDictAttrs"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        /></el-select>
        <input
          type="text"
          placeholder="搜索"
          class="starry-input"
          :class="{ 'is-focus': inputFocus }"
          :value="value"
          @focus="inputFocus = true"
          @input="$emit('update:value', $event.target.value)"
        />
        <el-icon class="input-search" titie="搜索" @click="$emit('search')">
          <svg
            t="1691677291443"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M932.140361 933.699368c-32.619932 32.832779-85.518722 32.832779-118.160143 0L666.508491 785.285177c-60.631916 39.089273-132.315538 62.448284-209.680557 62.448284-215.337393 0-389.92571-175.666882-389.92571-392.398018C66.902224 238.617609 241.490541 62.936401 456.827935 62.936401c215.362976 0 389.926734 175.681208 389.926734 392.399041 0 77.862345-23.203468 149.993153-62.08194 211.024158l147.46661 148.413168C964.785875 847.630107 964.785875 900.845099 932.140361 933.699368zM456.827935 175.049828c-153.809061 0-278.522458 125.491109-278.522458 280.285614 0 154.805762 124.713396 280.284591 278.522458 280.284591 153.834644 0 278.521434-125.478829 278.521434-280.284591C735.350392 300.540937 610.662579 175.049828 456.827935 175.049828z"
            />
          </svg>
        </el-icon>
        <el-icon class="input-reset" titie="重置" @click="resetSearch">
          <svg
            t="1691769194288"
            class="icon"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M715.7248 241.6896l-59.32032 73.04704 308.70016 28.62592-92.27776-295.168-73.3696 90.40384a464.29696 464.29696 0 0 0-275.9936-90.40384c-256.768 0-464.96256 207.616-464.96256 463.6672 0 256.11776 208.19456 463.6672 464.96256 463.6672 192.61952 0.16896 365.40928-118.41536 434.52416-298.20416a66.18112 66.18112 0 0 0-38.272-85.48352c-34.24256-13.08672-72.62208 4.00384-85.80096 38.20544-49.36192 128.45056-172.78464 213.17632-310.38976 213.05856-183.45984 0-332.20608-148.29568-332.20608-331.2384 0-182.87616 148.74624-331.17696 332.20608-331.17696 70.1952-0.00512 136.832 21.75488 192.19968 60.99968"
            />
          </svg>
        </el-icon>
      </div>
    </transition>
  </div>
</template>

<style lang="less" scoped>
.search-wrapper {
  position: fixed;
  top: 20vh;
  left: 50%;
  transform: translateX(-50%);
  overflow: hidden;
}
.input-wrapper {
  display: flex;
  align-items: center;
  color: var(--color-text);
  padding: 0 1.5625rem;
  border-radius: 1.875rem;
  backdrop-filter: blur(0.625rem) saturate(1.5);
  background-color: var(--color-background-blur);
  font-size: 0.875rem;
}

.label-select,
.attr-select {
  width: 8.125rem;
  color: var(--color-text);
  &:hover {
    :deep(.el-input__wrapper) {
      box-shadow: 0 0 0 0.0625rem var(--color-line) inset;
    }
  }
  :deep(.el-input) {
    &.is-focus {
      .el-input__wrapper {
        box-shadow: 0 0 0 0.0625rem var(--color-line) inset !important;
      }
    }
    .el-input__wrapper {
      box-shadow: 0 0 0 0.0625rem var(--color-line) inset;
      background-color: transparent;
      &.is-focus {
        box-shadow: 0 0 0 0.0625rem var(--color-line) inset !important;
      }
      .el-input__inner {
        &::placeholder {
          color: var(--color-text);
        }
      }
      .el-input__suffix {
        .el-icon.el-select__icon {
          color: var(--color-text);
        }
      }
    }
  }
}

.label-select {
  margin-right: 0.3125rem;
  width: 10.625rem;
}

.starry-input {
  box-sizing: border-box;
  outline: 0;
  border: none;
  width: 14.375rem;
  height: 2.6875rem;
  padding: 0 0 0 1.5625rem;
  background-color: transparent;
  transition: all var(--starry-sky-transition-time);
  &::placeholder {
    color: var(--color-text);
  }
  &:hover {
    width: 33.75rem;
  }
  &.is-focus {
    width: 33.75rem;
  }
}

.input-search,
.input-reset {
  cursor: pointer;
  transition: transform var(--starry-sky-transition-time);
  &:hover {
    transform: scale(1.1);
  }
}
.input-search {
  font-size: 1.5rem;
}
.input-reset {
  font-size: 1.3rem;
  margin-left: 0.3rem;
}
</style>
