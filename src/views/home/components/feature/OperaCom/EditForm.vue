<script setup>
import { ref, watch, inject } from 'vue';
import { useCommonStore } from '@/stores/modules/common';
import { ElInput, ElSelect, ElOption, ElMessage } from 'element-plus';
import { operaEditNode, executeTransaction } from '@/cypher/index';
import { SYSTEM_NODE_LABEL_NAME, SYSTEM_NODE_NAME, SYSTEM_NODE_PROPERTIES } from '@/config/setting';
import { checkExistSysLabel, checkExistSysProp } from '@/utils/index';

/* neo4j 驱动 */
const driver = inject('driver');
const getGraphDict = inject('getGraphDict');

/* 公共store */
const commonStore = useCommonStore();

/* 注入当前聚焦节点 */
const focusNode = inject('focusNode');

/* 属性列表 */
const eForm = ref([{ label: '标签', value: [], immutableAttr: true, isLabel: true }]);

/* 监听聚焦节点变化 */
watch(
  focusNode,
  (node) => {
    if (node) {
      let res = [
        {
          label: '标签',
          value: node[SYSTEM_NODE_LABEL_NAME],
          immutableAttr: true,
          isLabel: true
        }
      ];
      let tmpName = node[SYSTEM_NODE_NAME];
      for (let k in node) {
        if (SYSTEM_NODE_PROPERTIES.includes(k)) {
          continue;
        }
        if (node[k] === tmpName) {
          res.splice(1, 0, { label: k, value: node[k], immutableAttr: false });
        } else {
          res.push({ label: k, value: node[k], immutableAttr: false });
        }
      }
      eForm.value = res;
    } else {
      eForm.value = [{ label: '标签', value: [], immutableAttr: true, isLabel: true }];
    }
  },
  {
    immediate: true
  }
);

/* 新增属性 */
function addProp(idx) {
  eForm.value.splice(idx + 1, 0, { label: '', value: '', immutableAttr: false });
}
/* 移除属性 */
function rmProp(attr, idx) {
  if (!attr.immutableAttr) {
    eForm.value.splice(idx, 1);
  } else {
    ElMessage('固定属性不可删除！');
  }
}

/* 编辑节点 */
function submit() {
  if (!focusNode.value) {
    return ElMessage('请选择节点再进行编辑！');
  }
  if (eForm.value.length === 1) {
    return ElMessage('至少需要一项除标签以外的属性！');
  }
  if (eForm.value[0].value.length === 0) {
    return ElMessage('请填写标签值！');
  }
  // 检查是否存在内置标签
  let lFlag = checkExistSysLabel(eForm.value[0].value);
  if (lFlag) {
    return ElMessage(`${lFlag}是系统内置标签，请换个名称吧！`);
  }
  if (!eForm.value[1].label || !eForm.value[1].value) {
    return ElMessage('请填写属性或属性值！');
  }
  // 检查是否存在内置属性
  let attrs = eForm.value.map((i) => i.label);
  attrs.shift();
  let aFlag = checkExistSysProp(attrs);
  if (aFlag) {
    return ElMessage(`${aFlag}是系统内置属性，请换个名称吧！`);
  }
  const Session = driver.session();
  Session.writeTransaction((tx) =>
    executeTransaction(tx, operaEditNode(focusNode.value, eForm.value))
  )
    .then(() => {
      ElMessage('节点修改成功！');
      commonStore.setNeedReDraw(true);
      getGraphDict(['label', 'prop']);
      Session.close();
    })
    .catch((e) => ElMessage(e));
}

/* 快捷键
 * alt&+ 在末尾增加一条属性
 * alt&- 从末尾减去一条属性
 */
const activeTab = inject('activeTab');
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
});
/* 新增属性 */
function addNewProp() {
  eForm.value.push({ label: '', value: '', immutableAttr: false });
}
/* 移除属性 */
function removeProp() {
  if (eForm.value.length > 1) {
    eForm.value.pop();
  } else {
    ElMessage('固定属性不可删除！');
  }
}
// 操作属性
function operaForm(event) {
  if (event.altKey) {
    if (event.key === '=' || event.code === 'Equal' || event.keyCode === 187) {
      addNewProp();
    }
    if (event.key === '-' || event.code === 'Minus' || event.keyCode === 189) {
      removeProp();
    }
  }
}
watch(
  activeTab,
  (val) => {
    if (props.visible) {
      if (val.key === 2) {
        document.addEventListener('keydown', operaForm);
      } else {
        document.removeEventListener('keydown', operaForm);
      }
    }
  },
  { immediate: true }
);
watch(
  () => props.visible,
  (val) => {
    if (val) {
      if (activeTab.value.key === 2) {
        document.addEventListener('keydown', operaForm);
      } else {
        document.removeEventListener('keydown', operaForm);
      }
    }
  },
  { immediate: true }
);

/* 暴露提交方法 */
defineExpose({
  submit
});
</script>

<template>
  <div class="add-form">
    <div class="form-item" v-for="(attr, idx) in eForm" :key="idx">
      <template v-if="attr.isLabel">
        <el-input class="item-label" v-model="attr.label" disabled placeholder="属性名" />
        <el-select
          class="item-value"
          v-model="attr.value"
          clearable
          multiple
          filterable
          allow-create
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择已有标签或输入标签"
        >
          <el-option
            v-for="item in commonStore.dictLabels"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        /></el-select>
      </template>
      <template v-else>
        <el-select
          class="item-label"
          v-model="attr.label"
          clearable
          filterable
          allow-create
          collapse-tags
          collapse-tags-tooltip
          placeholder="属性名"
        >
          <el-option
            v-for="item in commonStore.dictAttrs"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        /></el-select>
        <template v-if="idx === 1">
          <el-input
            class="item-value"
            v-model="attr.value"
            type="textarea"
            autosize
            clearable
            placeholder="属性值, 此项将被指定为图谱中节点的显示名称"
          >
            <!-- <template #append>
              <el-tooltip
                effect="dark"
                content="此项将被指定为图谱中节点的显示名称"
                placement="bottom"
              >
                <el-icon><InfoFilled /></el-icon>
              </el-tooltip>
            </template> -->
          </el-input>
        </template>
        <template v-else>
          <el-input
            class="item-value"
            v-model="attr.value"
            type="textarea"
            autosize
            clearable
            placeholder="属性值"
          />
        </template>
      </template>

      <span class="item-opera">
        <el-icon @click="addProp(idx)"><Plus /></el-icon>
        <el-icon @click="rmProp(attr, idx)"><Minus /></el-icon>
      </span>
    </div>
  </div>
</template>

<style lang="less" scoped>
.form-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.625rem;
}
.item-label {
  flex: 0 0 22%;
}
.item-value {
  flex: 0 0 63%;
}
.item-opera {
  flex: 0 0 10%;
  display: flex;
  :deep(.el-icon) {
    padding: 0 0.3125rem;
  }
}

:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0 0.625rem;
}
</style>
