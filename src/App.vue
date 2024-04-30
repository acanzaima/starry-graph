<script setup>
import { onMounted, provide } from 'vue';
import { useCommonStore } from '@/stores/modules/common';
import neo4j from 'neo4j-driver/lib/browser/neo4j-web.esm';
import { NEO4J_USER_NAME, NEO4J_USER_PASSWORD } from '@/config/conect';
import { queryLabels, queryProperties, queryRelations } from '@/cypher/index';
import { transLabels, transProperties, transRelationsType } from '@/utils/index';

/* 公共store */
const commonStore = useCommonStore();

/* neo4j驱动 */
const driver = neo4j.driver(
  'neo4j://localhost',
  neo4j.auth.basic(NEO4J_USER_NAME, NEO4J_USER_PASSWORD)
);

/**
 * 查询图谱的全部标签，属性以及关系
 * @param {Array} dict 需要查询的图谱内容，包含标签，属性，关系
 * @returns cypher query result
 */
function getGraphDict(dict = ['label', 'prop', 'relation']) {
  if (dict.includes('label')) {
    driver.executeQuery(queryLabels()).then((res) => {
      let tmpLabels = transLabels(res.records);
      commonStore.setDictLabels(tmpLabels);
    });
  }
  if (dict.includes('prop')) {
    driver.executeQuery(queryProperties()).then((res) => {
      let tmpProps = transProperties(res.records);
      commonStore.setDictAttrs(tmpProps);
    });
  }
  if (dict.includes('relation')) {
    driver.executeQuery(queryRelations()).then((res) => {
      let tmpRelations = transRelationsType(res.records);
      commonStore.setAictRelations(tmpRelations);
    });
  }
}

/* 挂载时查询 初始化 */
onMounted(() => {
  getGraphDict();
});

/* 全局注入neo4j-driver getGraphDict */
provide('driver', driver);
provide('getGraphDict', getGraphDict);
</script>
<template>
  <RouterView />
</template>
