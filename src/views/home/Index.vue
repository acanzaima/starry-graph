<script setup>
import { ref, inject, onMounted, onBeforeUnmount, provide } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import queryUtils from '@/cypher/index';
import { transNodes, transRelations } from '@/utils/index';
import { SYSTEM_NODE_ID } from '@/config/setting';
import SearchBtn from './components/tools/SearchBtn.vue';
import ThemeSwitch from './components/tools/ThemeSwitch.vue';
import MockData from './components/tools/MockData.vue';
import GitLink from './components/tools/GitLink.vue';
import ToolBox from './components/tools/ToolBox.vue';
import SearchInput from './components/feature/SearchInput.vue';
import OperaModal from './components/feature/OperaModal.vue';
import DrawBoard from './components/graph/DrawBoard.vue';
import { operaAddNode, operaCreateRelation } from '@/cypher/index';

/* neo4j 驱动 */
const driver = inject('driver');
/* 卸载时关闭连接 */
onBeforeUnmount(() => {
  driver.close();
});

/** @功能 全局搜索 */
const nodes = ref([]);
const nodesMap = ref({});
const edges = ref([]);
const edgesMap = ref({});
const searchLabels = ref([]);
const searchAttr = ref();
const searchValue = ref('');
const showSearch = ref(false);
// 搜索
function serachGraph() {
  let params = { labels: searchLabels.value, attr: searchAttr.value, value: searchValue.value };
  driver.executeQuery(queryUtils.queryGraph(params)).then((res) => {
    let nodes = res.records[0].get('nodes') || [];
    let edges = res.records[0].get('edges') || [];
    if (nodes.length > 0) {
      handleNodes(nodes, true);
      handleEdges(edges, true);
    } else {
      ElMessage('未查询到符合条件的节点');
    }
  });
}
/* 挂载请求 */
onMounted(() => {
  serachGraph();
});
/* 刷新 */
function reload() {
  serachGraph();
}
// 转换节点
function handleNodes(records, flag = false) {
  nodes.value = transNodes(records, flag);
  nodesMap.value = {};
  nodes.value.forEach((i) => {
    nodesMap.value[i[SYSTEM_NODE_ID]] = i;
  });
}
// 转换关系
function handleEdges(records, flag = false) {
  edges.value = transRelations(records, flag);
  edgesMap.value = {};
  edges.value.forEach((i) => {
    edgesMap.value[i[SYSTEM_NODE_ID]] = i;
  });
}

/* 空格快捷键 */
function toggleSearch(event) {
  if (event.key === ' ' || event.code === 'Space' || event.keyCode === 32) {
    showSearch.value = !showSearch.value;
  }
}
onMounted(() => {
  document.addEventListener('keydown', toggleSearch);
});
onBeforeUnmount(() => {
  document.removeEventListener('keydown', toggleSearch);
});

/* 监听鼠标按下放开事件 */
const downTime = ref();
function handleMouseDown() {
  downTime.value = Date.now();
}
function handleMouseUp() {
  if (Date.now() - downTime.value < 500) {
    showSearch.value = false;
  }
}

/** @功能 全局操作 */
const mode = ref(1);
const focusNode = ref();
const showOpera = ref(false);

/* 打开model */
function showOperaModal() {
  mode.value = 1;
  focusNode.value = null;
  showOpera.value = true;
}

/** @功能 编辑节点信息 */
function editInfo(id) {
  mode.value = 2;
  showOpera.value = true;
  focusNode.value = nodesMap.value[id];
}

/** @功能 编辑/创建关系 */
function editRelation(id) {
  mode.value = 3;
  showOpera.value = true;
  focusNode.value = nodesMap.value[id];
}

/** @功能 查询与目标节点直接关联的节点及关系 */
const graphIns = ref();
function queryNetwork(id) {
  driver.executeQuery(queryUtils.queryRelatedNodeById(id)).then((res) => {
    let nodeList = res.records[0].get('nodes') || [];
    let edgeList = res.records[0].get('edges') || [];
    let tNodes = transNodes(nodeList, true);
    let tEdges = transRelations(edgeList, true);
    // 存储节点 关系信息
    let resNodes = [];
    tNodes.forEach((i) => {
      if (!nodesMap.value[i[SYSTEM_NODE_ID]]) {
        resNodes.push(i);
        nodesMap.value[i[SYSTEM_NODE_ID]] = i;
      }
    });
    let resEdges = [];
    tEdges.forEach((i) => {
      if (!edgesMap.value[i[SYSTEM_NODE_ID]]) {
        resEdges.push(i);
        edgesMap.value[i[SYSTEM_NODE_ID]] = i;
      }
    });
    if (resNodes.length > 0) {
      nodes.value.push(...resNodes);
      edges.value.push(...resEdges);

      // 子组件更新节点 关系
      graphIns.value.addNodesAndEdges(resNodes);
      graphIns.value.addNodesAndEdges(resEdges, 'edge');
    } else {
      ElMessage('暂无关联节点');
    }
  });
}

// 模拟添加数据
const mockCount = ref(100);
async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
const mockNodes = async () => {
  for (let i = 1; i <= mockCount.value; i++) {
    const nodes = [
      { label: '标签', value: ['模拟'], immutableAttr: true, isLabel: true },
      { label: '名称', value: `模拟节点${i}`, immutableAttr: true, isLabel: true }
    ];
    driver
      .executeQuery(operaAddNode(nodes))
      .then(() => {
        ElMessage(`节点${i}创建成功！`);
      })
      .catch((e) => ElMessage(e));
    await sleep(200);
  }
};
const mockEdges = async () => {
  let fromId = 0;
  let step = Math.floor(mockCount.value / 10);
  while (fromId < mockCount.value) {
    for (let i = fromId + 1; i <= fromId + step; i++) {
      let info = {
        from: fromId,
        target: i,
        relation: '模拟关系',
        comment: '模拟关系说明'
      };
      driver
        .executeQuery(operaCreateRelation(info))
        .then(() => {
          ElMessage(`关系${fromId}→${i}创建成功！`);
        })
        .catch((e) => {
          ElMessage(e);
        });
      await sleep(200);
    }
    fromId += step + 1;
  }
};

const simulateData = () => {
  ElMessageBox.prompt('请输入你要模拟的节点数量', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /[0-9]+/,
    inputErrorMessage: '请输入数字'
  })
    .then(async ({ value }) => {
      mockCount.value = parseInt(value);
      await mockNodes();
      await mockEdges();
      reload();
    })
    .catch(() => {
      this.$message({
        type: 'info',
        message: '取消输入'
      });
    });
};

/* 注入当前操作node */
provide('focusNode', focusNode);
</script>

<template>
  <div class="graph-home">
    <div class="home-opera">
      <search-btn class="opera-item" @click="showSearch = !showSearch" />
      <tool-box class="opera-item" @click="showOperaModal" />
      <theme-switch class="opera-item" />
      <mock-data class="opera-item" @click="simulateData" />
      <git-link class="opera-item" />
    </div>
    <draw-board
      ref="graphIns"
      class="graph-instance"
      :class="{ 'is-blur': showSearch }"
      :graph-nodes="nodes"
      :graph-edges="edges"
      :nodes-map="nodesMap"
      :edges-map="edgesMap"
      @edit-info="editInfo"
      @edit-relation="editRelation"
      @query-network="queryNetwork"
      @delete-node="reload"
      @delete-edge="reload"
      @edit-edge="reload"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
    />
    <search-input
      v-model:labels="searchLabels"
      v-model:attr="searchAttr"
      v-model:value="searchValue"
      :visible="showSearch"
      @search="serachGraph"
    />
    <opera-modal v-model:visible="showOpera" @reload="reload" :mode="mode" />
  </div>
</template>

<style lang="less" scoped>
.graph-home {
  height: 100%;
  position: relative;
}
.home-opera {
  position: absolute;
  right: 0;
  padding: 0.5rem;
  width: 4rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 100;
  .opera-item {
    width: var(--opera-tool-width);
    height: var(--opera-tool-height);
    margin: calc(var(--opera-tool-width) / 3) 0;
    font-size: var(--opera-tool-font-size);
    cursor: pointer;
  }
}
.graph-instance {
  width: 100%;
  height: 100%;
  // transition: transform var(--starry-sky-transition-time), filter var(--starry-sky-transition-time);
  // &.is-blur {
  //   transform: scale(1.1);
  //   filter: blur(1rem);
  // }
}
</style>
