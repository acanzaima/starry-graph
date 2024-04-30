<script setup>
import { ref, reactive, watch, inject } from 'vue';
import { useCommonStore } from '@/stores/modules/common';
import {
  ElForm,
  ElFormItem,
  ElAutocomplete,
  ElSelect,
  ElInput,
  ElOption,
  ElTag,
  ElMessage
} from 'element-plus';
import { queryNodeByIdName, operaCreateRelation } from '@/cypher/index';
import { transNodes } from '@/utils/index';
import { SYSTEM_NODE_LABEL_NAME, SYSTEM_NODE_NAME, SYSTEM_NODE_ID } from '@/config/setting';

/* neo4j 驱动 */
const driver = inject('driver');
const getGraphDict = inject('getGraphDict');

/* 公共store */
const commonStore = useCommonStore();

/* 注入当前聚焦节点 */
const focusNode = inject('focusNode');

const rForm = reactive({
  from: null,
  relation: null,
  comment: null,
  target: null
});

// 关系起源
const fromNode = ref();
// 关系目标
const targetNode = ref();

/* 监听聚焦节点变化 */
watch(
  focusNode,
  (node) => {
    if (node) {
      rForm.from = node[SYSTEM_NODE_NAME];
      fromNode.value = node;
    }
  },
  {
    immediate: true
  }
);

/* 查询节点 */
const queryNode = async (queryString, cb) => {
  let results = [];
  if (queryString) {
    await driver.executeQuery(queryNodeByIdName(queryString)).then((res) => {
      results = transNodes(res.records);
    });
  }
  cb(results);
};

/* 选中建议 */
function handleSelect(item, cate) {
  if (cate === 1) {
    fromNode.value = item;
  } else {
    targetNode.value = item;
  }
}

/* 编辑关系 */
function submit() {
  if (!rForm.from) {
    return ElMessage('请选择关系起源');
  }
  if (!fromNode.value || fromNode.value[SYSTEM_NODE_NAME] !== rForm.from) {
    return ElMessage('关系起源不支持输入自定义节点，请直接选用搜索结果项');
  }
  if (!rForm.relation) {
    return ElMessage('请选择或输入关系');
  }
  if (!rForm.target) {
    return ElMessage('请选择关系指向');
  }
  if (!targetNode.value || targetNode.value[SYSTEM_NODE_NAME] !== rForm.target) {
    return ElMessage('关系指向不支持输入自定义节点，请直接选用搜索结果项');
  }
  let info = {
    from: fromNode.value[SYSTEM_NODE_ID],
    target: targetNode.value[SYSTEM_NODE_ID],
    relation: rForm.relation,
    comment: rForm.comment
  };
  driver
    .executeQuery(operaCreateRelation(info))
    .then(() => {
      ElMessage('关系创建成功！');
      commonStore.setNeedReDraw(true);
      // 清空表单
      for (let k in rForm) {
        if (k !== 'from') {
          rForm[k] = null;
        }
      }
      targetNode.value = null;
      getGraphDict(['relation']);
    })
    .catch((e) => {
      ElMessage(e);
    });
}

/* 暴露提交方法 */
defineExpose({
  submit
});
</script>

<template>
  <div class="relation-form">
    <el-form>
      <el-form-item label="关系起源">
        <el-autocomplete
          v-model="rForm.from"
          :value-key="`${SYSTEM_NODE_NAME}`"
          :trigger-on-focus="false"
          clearable
          class="inline-input w-50"
          :fetch-suggestions="queryNode"
          placeholder="支持输入节点显示名称或ID搜索指定节点"
          style="width: 100%"
          @select="handleSelect($event, 1)"
        >
          <template #default="{ item }">
            <div class="name">{{ item[SYSTEM_NODE_NAME] }}</div>
            <span class="label">
              <el-tag
                v-for="(k, idx) in item[SYSTEM_NODE_LABEL_NAME]"
                :key="idx"
                effect="dark"
                style="margin: 0 0.5rem 0.5rem 0"
              >
                {{ k }}
              </el-tag>
            </span>
          </template>
        </el-autocomplete>
      </el-form-item>

      <el-form-item label="关系名称">
        <el-select
          v-model="rForm.relation"
          clearable
          filterable
          allow-create
          collapse-tags
          collapse-tags-tooltip
          placeholder="选择已有关系或输入关系"
          style="width: 100%"
        >
          <el-option
            v-for="item in commonStore.dictRelations"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        /></el-select>
      </el-form-item>

      <el-form-item label="关系含义">
        <el-input
          class="item-label"
          v-model="rForm.comment"
          :rows="1"
          type="textarea"
          autosize
          clearable
          placeholder="请输入关系含义, 可为空"
        />
      </el-form-item>

      <el-form-item label="关系指向">
        <el-autocomplete
          v-model="rForm.target"
          :value-key="`${SYSTEM_NODE_NAME}`"
          :trigger-on-focus="false"
          clearable
          class="inline-input w-50"
          :fetch-suggestions="queryNode"
          placeholder="支持输入节点显示名称或ID搜索指定节点"
          style="width: 100%"
          @select="handleSelect($event, 2)"
        >
          <template #default="{ item }">
            <div class="name">{{ item[SYSTEM_NODE_NAME] }}</div>
            <span class="label">
              <el-tag
                v-for="(k, idx) in item[SYSTEM_NODE_LABEL_NAME]"
                :key="idx"
                effect="dark"
                style="margin: 0 0.5rem 0.5rem 0"
              >
                {{ k }}
              </el-tag>
            </span>
          </template>
        </el-autocomplete>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="less" scoped>
.relation-form {
  padding: 0 0.3125rem;
}
</style>
