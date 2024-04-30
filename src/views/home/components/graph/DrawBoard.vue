<script setup>
import { ref, reactive, toRef, onMounted, onUnmounted, watch, inject } from 'vue';
import {
  ElMessageBox,
  ElMessage,
  ElInput,
  ElTag,
  ElButton,
  ElPopover,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus';
import { useThemeStore } from '@/stores/modules/theme';
import {
  SYSTEM_NODE_LABEL_NAME,
  SYSTEM_NODE_NAME,
  SYSTEM_NODE_ID,
  SYSTEM_RELATION_COMMENT
} from '@/config/setting';
import {
  operaDeleteNode,
  operaDeleteEdge,
  operaEditRelation,
  executeTransaction
} from '@/cypher/index';
import { useMouse } from '@/hooks/use-mouse';
import Vis from 'vis-network/dist/vis-network.min.js';
import('vis-network/dist/dist/vis-network.min.css');

/* neo4j 驱动 */
const driver = inject('driver');

/* props */
const props = defineProps({
  graphNodes: {
    type: Array,
    default: () => []
  },
  nodesMap: {
    type: Object,
    default: () => {}
  },
  graphEdges: {
    type: Array,
    default: () => {}
  },
  edgesMap: {
    type: Object,
    default: () => {}
  }
});

// 主题
const useTheme = toRef(useThemeStore(), 'theme');

/* 图容器 */
const visContainer = ref();
// vis实例
let visGraph;
// 使用节点数据
let nodes = new Vis.DataSet([]);
// 使用边数据
let edges = new Vis.DataSet([]);
// 配置
let options = {
  autoResize: true, //网络将自动检测其容器的大小调整，并相应地重绘自身
  locale: 'cn', //语言设置：工具栏显示中文 默认 'en'
  clickToUse: false, // 激活实例时(获取到焦点),其中事件才会相响应
  // 组模块
  groups: {
    // useDefaultGroups: true,
    // root: {
    //   color: { background: '#096dd9' },
    // }
  },
  // 设置节点样式
  nodes: {
    shape: 'dot', //节点的外观。为circle时label显示在节点内，为dot时label显示在节点下方
    size: 50, //节点的大小，
    shadow: true, //如果为true，则节点使用默认设置投射阴影。
    font: {
      //字体配置
      size: 25,
      color: '#FFFFFF',
      align: 'center'
    },
    color: {
      border: 'rgb(243, 105, 36)', //节点边框颜色
      background: 'rgb(247, 151, 103)', //节点背景颜色
      //节点选中时状态颜色
      highlight: {
        border: 'rgb(243, 105, 36)',
        background: 'rgb(243, 105, 36)'
      },
      // 鼠标悬浮状态
      hover: {
        background: 'rgb(243, 105, 36)'
      }
    },
    borderWidth: 2, //节点边框宽度，单位为px
    borderWidthSelected: 3 //节点被选中时边框的宽度，单位为px
  },
  // 边线配置
  edges: {
    width: 2,
    length: 350,
    color: {
      color: 'rgb(247, 151, 103)',
      highlight: 'rgb(243, 105, 36)',
      hover: 'rgb(243, 105, 36)',
      inherit: 'from',
      opacity: 1.0
    },
    font: {
      color: '#DDDDDD',
      size: 20,
      background: 'none',
      align: 'top',
      strokeWidth: 0
    },
    smooth: {
      //设置两个节点之前的连线的状态
      //默认是true，设置为false之后，两个节点之前的连线始终为直线，不会出现贝塞尔曲线
      enabled: true
    },
    arrows: { to: true } //箭头指向to
  },
  // 布局
  layout: {
    improvedLayout: true,
    clusterThreshold: 200
  },
  //计算节点之间斥力，进行自动排列的属性
  physics: {
    enabled: true, //默认是true，设置为false后，节点将不会自动改变，拖动谁谁动。不影响其他的节点
    solver: 'barnesHut',
    minVelocity: 10,
    barnesHut: {
      gravitationalConstant: -10000,
      centralGravity: 0.1,
      springLength: 100,
      springConstant: 0.15,
      damping: 0.05,
      avoidOverlap: 0
    },
    timestep: 0.5,
    adaptiveTimestep: true,
    maxVelocity: 50
  },
  //用于所有用户与网络的交互。处理鼠标和触摸事件以及导航按钮和弹出窗口
  interaction: {
    dragNodes: true, //是否能拖动节点
    dragView: true, //是否能拖动画布
    hover: true, //鼠标移过后加粗该节点和连接线
    multiselect: false, //按 ctrl 多选
    selectable: true, //是否可以点击选择
    selectConnectedEdges: true, //选择节点后是否显示连接线
    hoverConnectedEdges: true, //鼠标滑动节点后是否显示连接线
    zoomView: true, //是否能缩放画布
    hideEdgesOnDrag: false //
  }
};

// 挂载后初始化
onMounted(() => {
  init();
});

/* 监听节点数据变化 */
watch(
  () => props.graphNodes,
  (val) => {
    nodes = new Vis.DataSet(
      val.map((i) => {
        return { id: i[SYSTEM_NODE_ID], label: i[SYSTEM_NODE_NAME] };
      })
    );
    updateGraphData();
  }
);
watch(
  () => props.graphEdges,
  (val) => {
    edges = new Vis.DataSet(
      val.map((i) => {
        return {
          id: String(i[SYSTEM_NODE_ID]),
          from: i.from,
          to: i.to,
          label: i.label
        };
      })
    );
    updateGraphData();
  }
);

/* vis实例更新数据 */
function updateGraphData() {
  if (nodes.length > 0 || edges.length > 0) {
    visGraph.setData({ nodes: nodes, edges: edges });
  }
}

/** 新增节点 关系 */
function addNodesAndEdges(arr, type = 'node') {
  if (type === 'node') {
    arr.forEach((i) => {
      nodes.add({ id: i[SYSTEM_NODE_ID], label: i[SYSTEM_NODE_NAME] });
    });
  } else {
    arr.forEach((i) => {
      edges.add({ id: String(i[SYSTEM_NODE_ID]), from: i.from, to: i.to, label: i.label });
    });
  }
}

// 监听主题变化更新配置
watch(
  useTheme,
  (val) => {
    if (val === 'light') {
      options.nodes.font.color = '#2c3e50';
      options.edges.font.color = '#2c3e50';
    } else {
      options.nodes.font.color = '#FFFFFF';
      options.edges.font.color = '#DDDDDD';
    }
    if (visGraph) {
      visGraph.setOptions(options);
    }
  },
  {
    immediate: true
  }
);

// 选中节点id
let selectedId = ref(null);
// 选中节点位置
let nodePos = reactive({
  x: 0,
  y: 0
});
// 选中关系id
let selectedEdge = ref(null);
// 选中关系位置
const edgePosX = ref(0);
const edgePosY = ref(0);
// 图谱缩放比例
let graphScale = ref(1);

//初始化图谱参数配置
function init() {
  //   生成图谱
  visGraph = new Vis.Network(visContainer.value, { nodes, edges }, options);

  // 监听鼠标拖动事件
  visGraph.on('dragging', () => {
    if (selectedId.value) {
      getNodePos();
      followPos(nodePos.x, nodePos.y);
    }
  });

  // 监听鼠标缩放事件
  visGraph.on('zoom', (e) => {
    graphScale.value = e.scale;
    hideOpera();
  });
  // 事件监听:  绘制完成
  visGraph.on('afterDrawing', () => {
    // 实时更新操作框位置
    if (selectedId.value) {
      getNodePos();
      followPos(nodePos.x, nodePos.y);
    }
  });
  // 点击鼠标事件
  visGraph.on('click', (e) => {
    hideOpera();
    // 节点触发点击操作
    if (e.nodes.length > 0) {
      selectedId.value = e.nodes[0];
      getNodePos();
      followPos(nodePos.x, nodePos.y);
      showOpera();
    } else if (e.edges.length > 0) {
      selectedEdge.value = e.edges[0];
      edgePosX.value = e.pointer.DOM.x + 'px';
      edgePosY.value = e.pointer.DOM.y + 'px';
      showEdgeetail();
    }
  });
  // 节点hover事件
  visGraph.on('hoverNode', (e) => {
    showFloat(e);
  });
  // 节点blur事件
  visGraph.on('blurNode', (e) => {
    hideFloat(e);
  });
}

/* 节点操作集合 */
const operaVisible = ref(false);
// 获取点击节点在dom中的位置
function getNodePos(x = null, y = null) {
  if (x && y) {
    nodePos.x = x;
    nodePos.y = y;
  } else {
    let pos = visGraph.getPosition(selectedId.value);
    let domPosi = visGraph.canvasToDOM({
      x: pos['x'],
      y: pos['y']
    });
    nodePos.x = domPosi.x;
    nodePos.y = domPosi.y;
  }
}
// 隐藏节点操作
function hideOpera() {
  operaVisible.value = false;
}
//  显示节点操作
function showOpera() {
  operaVisible.value = true;
}

// 更新操作框位置
const operaWrapper = ref();
function followPos(x, y) {
  operaWrapper.value.style.top = y - 25 * graphScale.value + 'px';
  operaWrapper.value.style.left = x - 25 * graphScale.value + 'px';
}

// 点击操作按钮
const emits = defineEmits([
  'edit-info',
  'edit-relation',
  'query-network',
  'delete-node',
  'delete-edge',
  'edit-edge'
]);
function operaClick(val) {
  if (val === 1) {
    editNode();
  }
  if (val === 2) {
    editRelateship();
  }
  if (val === 3) {
    queryRelateship();
  }
  if (val === 4) {
    delNode();
  }
}

// 编辑节点信息
function editNode() {
  emits('edit-info', selectedId.value);
}

// 编辑/创建关系
function editRelateship() {
  emits('edit-relation', selectedId.value);
}

// 获取所有关系节点
function queryRelateship() {
  emits('query-network', selectedId.value);
}

// 删除节点
function delNode() {
  ElMessageBox.confirm('确认删除节点?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      driver
        .executeQuery(operaDeleteNode(selectedId.value))
        .then(() => {
          ElMessage('节点删除成功！');
          selectedId.value = null;
          emits('delete-node');
          hideOpera();
        })
        .catch((e) => ElMessage(e));
    })
    .catch(() => {});
}

/* 关系操作 */
const showPopoer = ref(false);
const curRelation = ref({ props: {} });
const tmpStoreRelation = reactive({
  label: null,
  [SYSTEM_RELATION_COMMENT]: null
});
// 显示关系详情
function showEdgeetail() {
  curRelation.value = props.edgesMap[selectedEdge.value];
  // 暂存关系信息 用于提交时比对是否发生变化
  tmpStoreRelation.label = curRelation.value.label;
  tmpStoreRelation[SYSTEM_RELATION_COMMENT] = curRelation.value.props[SYSTEM_RELATION_COMMENT];
  showPopoer.value = true;
}

// 编辑关系
function editRelation() {
  curRelation.value.isEdit = true;
}

// 取消编辑
function cancelEdit() {
  // 复原
  curRelation.value.label = tmpStoreRelation.label;
  curRelation.value.props[SYSTEM_RELATION_COMMENT] = tmpStoreRelation[SYSTEM_RELATION_COMMENT];
  curRelation.value.isEdit = false;
}

// 保存关系编辑
function submitRelation() {
  let params = {
    [SYSTEM_NODE_ID]: curRelation.value[SYSTEM_NODE_ID],
    from: curRelation.value.from,
    to: curRelation.value.to,
    [SYSTEM_RELATION_COMMENT]: curRelation.value.props[SYSTEM_RELATION_COMMENT]
  };

  let needExcute = false;
  if (curRelation.value.label !== tmpStoreRelation.label) {
    params.label = curRelation.value.label;
    needExcute = true;
  }
  if (
    curRelation.value.props[SYSTEM_RELATION_COMMENT] !== tmpStoreRelation[SYSTEM_RELATION_COMMENT]
  ) {
    needExcute = true;
  }

  if (needExcute) {
    const Session = driver.session();
    Session.writeTransaction((tx) => executeTransaction(tx, operaEditRelation(params))).then(() => {
      ElMessage('关系编辑成功！');
      emits('edit-edge');
      Session.close();
    });
  }
  curRelation.value.isEdit = false;
}

// 删除关系
function delRelation() {
  ElMessageBox.confirm('确认删除关系?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'info'
  })
    .then(() => {
      driver
        .executeQuery(operaDeleteEdge(selectedEdge.value))
        .then(() => {
          ElMessage('关系删除成功！');
          emits('delete-edge');
        })
        .catch((e) => ElMessage(e));
    })
    .catch(() => {});
}

// 使用hooks
const { mouseX, mouseY, startListen, stopListen } = useMouse();
const floatFixed = ref(false);
// 监听组合键事件
onMounted(() => {
  document.addEventListener('keydown', tooggleFloat);
});
onUnmounted(() => {
  document.removeEventListener('keydown', tooggleFloat);
});
function tooggleFloat(event) {
  if (event.altKey) {
    if (event.key === 'G' || event.code === 'KeyG' || event.keyCode === 71) {
      if (floatFixed.value) {
        startListen();
      } else {
        stopListen();
      }
      floatFixed.value = !floatFixed.value;
    }
  }
}

// 处理鼠标悬浮节点时展示详情
const showFloatInfo = ref(false);
const hoverNode = ref({});
function showFloat(e) {
  // 处理节点信息
  let nodeInfo = props.nodesMap[e.node] || {};
  let tmpNode = {};
  for (let k in nodeInfo) {
    if (k === SYSTEM_NODE_NAME) {
      continue;
    } else if (k === SYSTEM_NODE_ID) {
      tmpNode.id = nodeInfo[k];
    } else if (k === SYSTEM_NODE_LABEL_NAME) {
      tmpNode['标签'] = nodeInfo[k];
    } else {
      tmpNode[k] = nodeInfo[k];
    }
  }
  hoverNode.value = tmpNode;
  showFloatInfo.value = true;
}
function hideFloat() {
  // 固定时不消失
  if (floatFixed.value) return;
  showFloatInfo.value = false;
}

// 暴露方法
defineExpose({
  addNodesAndEdges
});
</script>

<template>
  <div class="vis-wrapper">
    <div ref="visContainer" class="vis-instance"></div>
    <transition name="fade" mode="out-in" appear>
      <div class="opera-wrapper" ref="operaWrapper" v-show="operaVisible">
        <div class="opera-icon edit-node" @click="operaClick(1)">
          <el-icon>
            <svg
              t="1689689955215"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M959.901158 643.014672a36.966795 36.966795 0 0 0-47.839382 21.399228c-62.8139 164.373745-223.283398 274.878764-399.271042 274.878764-235.63861 0-427.292664-191.654054-427.292665-427.243243 0-235.63861 191.654054-427.292664 427.292665-427.292664 221.257143 0 408.315058 172.528185 425.859459 392.796911l36.966795-2.965251-36.522007 9.241699 37.016216-2.32278 36.472587-9.834749C991.925869 213.152124 772.398456 10.625483 512.790734 10.625483 236.281081 10.625483 11.366795 235.539768 11.366795 512.049421c0 276.460232 224.914286 501.374517 501.423939 501.374517 206.579151 0 394.823166-129.630888 468.460231-322.520463a37.016216 37.016216 0 0 0-21.349807-47.888803z"
              />
              <path
                d="M481.16139 271.765251L295.882625 456.994595c-0.296525 0.296525-0.395367 0.741313-0.642471 1.037837a36.571429 36.571429 0 0 0-7.116602 10.576062c-0.247104 0.642471-0.345946 1.383784-0.59305 2.026255-0.840154 2.32278-1.72973 4.64556-2.075676 7.166023l-35.879536 243.2a37.2139 37.2139 0 0 0 42.057142 42.106564l243.2-35.879537c2.32278-0.345946 4.447876-1.1861 6.622394-1.927413 0.840154-0.296525 1.630888-0.395367 2.471043-0.741313a37.26332 37.26332 0 0 0 10.724324-7.116602c0.296525-0.296525 0.691892-0.395367 1.037838-0.691892l185.278764-185.229343a136.203861 136.203861 0 0 0 0-192.247105l-67.558301-67.50888c-51.2-51.150579-141.047104-51.150579-192.247104 0z m-150.931274 410.687259l17.791506-120.883398 103.091892 103.091892-120.883398 17.791506z m358.301158-203.366796l-159.085714 159.036294-154.934363-154.934363 159.085714-159.036294c23.178378-23.178378 64.197683-23.178378 87.376062 0l67.558301 67.508881a62.023166 62.023166 0 0 1 0 87.425482z"
              />
            </svg>
          </el-icon>
        </div>
        <div class="opera-icon edit-relation" @click="operaClick(2)">
          <el-icon>
            <svg
              t="1690902210929"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M601.6 25.6H108.8c-44.8 0-80 35.2-80 80v492.8c0 44.8 36.8 80 80 80h168v-65.6H88V89.6h531.2v523.2h-121.6v65.6h104c44.8 0 80-36.8 80-80V105.6c0-44.8-36.8-80-80-80zM428.8 998.4h492.8c44.8 0 80-36.8 80-80V425.6c0-44.8-36.8-80-80-80H753.6v65.6h187.2v523.2H411.2V411.2h121.6v-65.6h-104c-44.8 0-80 36.8-80 80v492.8c0 44.8 36.8 80 80 80z"
              />
            </svg>
          </el-icon>
        </div>
        <div class="opera-icon query-relation" @click="operaClick(3)">
          <el-icon>
            <svg
              t="1689689566808"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M870.4 711.111111c-28.444444 0-56.888889 8.533333-79.644444 22.755556l-162.133334-156.444445c25.6-34.133333 42.666667-76.8 42.666667-122.311111 0-42.666667-14.222222-82.488889-36.977778-113.777778l93.866667-99.555555c17.066667 8.533333 36.977778 17.066667 56.888889 17.066666 62.577778 0 113.777778-51.2 113.777777-113.777777s-51.2-113.777778-113.777777-113.777778-113.777778 51.2-113.777778 113.777778c0 22.755556 5.688889 39.822222 17.066667 56.888889l-93.866667 99.555555c-31.288889-28.444444-73.955556-45.511111-122.311111-45.511111-48.355556 0-93.866667 17.066667-130.844445 48.355556L258.844444 227.555556c8.533333-17.066667 14.222222-36.977778 14.222223-56.888889 0-62.577778-51.2-113.777778-113.777778-113.777778s-113.777778 51.2-113.777778 113.777778 51.2 113.777778 113.777778 113.777777c22.755556 0 42.666667-5.688889 59.733333-17.066666l88.177778 79.644444c-22.755556 31.288889-34.133333 68.266667-34.133333 108.088889 0 51.2 19.911111 96.711111 51.2 130.844445l-59.733334 62.577777c-22.755556-14.222222-48.355556-22.755556-76.8-22.755555-79.644444 0-142.222222 62.577778-142.222222 142.222222s62.577778 142.222222 142.222222 142.222222 142.222222-62.577778 142.222223-142.222222c0-28.444444-8.533333-56.888889-25.6-79.644444l59.733333-65.422223c31.288889 19.911111 68.266667 31.288889 105.244444 31.288889 42.666667 0 82.488889-14.222222 113.777778-36.977778l164.977778 156.444445c-11.377778 22.755556-19.911111 51.2-19.911111 79.644444 0 79.644444 62.577778 142.222222 142.222222 142.222223s142.222222-62.577778 142.222222-142.222223-62.577778-142.222222-142.222222-142.222222z m-85.333333-625.777778c31.288889 0 56.888889 25.6 56.888889 56.888889s-25.6 56.888889-56.888889 56.888889-56.888889-25.6-56.888889-56.888889 25.6-56.888889 56.888889-56.888889z m-682.666667 85.333334c0-31.288889 25.6-56.888889 56.888889-56.888889s56.888889 25.6 56.888889 56.888889-25.6 56.888889-56.888889 56.888889-56.888889-25.6-56.888889-56.888889z m85.333333 682.666666c-48.355556 0-85.333333-36.977778-85.333333-85.333333s36.977778-85.333333 85.333333-85.333333c14.222222 0 25.6 2.844444 36.977778 8.533333l39.822222 36.977778c5.688889 11.377778 8.533333 25.6 8.533334 39.822222 0 48.355556-36.977778 85.333333-85.333334 85.333333z m284.444445-256c-79.644444 0-142.222222-62.577778-142.222222-142.222222s62.577778-142.222222 142.222222-142.222222 142.222222 62.577778 142.222222 142.222222-62.577778 142.222222-142.222222 142.222222z m398.222222 341.333334c-48.355556 0-85.333333-36.977778-85.333333-85.333334s36.977778-85.333333 85.333333-85.333333 85.333333 36.977778 85.333333 85.333333-36.977778 85.333333-85.333333 85.333334z"
              />
            </svg>
          </el-icon>
        </div>
        <div class="opera-icon delete-node" @click="operaClick(4)">
          <el-icon>
            <svg
              t="1690299173271"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M198.144157 928.767536a102.399949 102.399949 0 0 0 102.399949 95.231952h423.935788a102.399949 102.399949 0 0 0 102.399949-95.231952L870.399821 307.199846H153.600179zM921.599795 102.399949h-204.799897a102.399949 102.399949 0 0 0-102.399949-102.399949H409.600051a102.399949 102.399949 0 0 0-102.399949 102.399949H102.400205a51.199974 51.199974 0 0 0 0 102.399949h819.19959a51.199974 51.199974 0 0 0 0-102.399949z"
              />
            </svg>
          </el-icon>
        </div>
      </div>
    </transition>
    <el-popover trigger="click" :width="270" v-model:visible="showPopoer">
      <template #reference>
        <div class="relation-place"></div>
      </template>
      <div class="relation-detail">
        <el-descriptions title="关系详情" :column="1">
          <el-descriptions-item label="名称：">
            <template v-if="curRelation.isEdit">
              <el-input
                style="display: inline-block"
                v-model="curRelation.label"
                placeholder="关系名"
              />
            </template>
            <template v-else>
              {{ curRelation.label }}
            </template>
          </el-descriptions-item>
          <el-descriptions-item label="含义：">
            <template v-if="curRelation.isEdit">
              <el-input
                style="display: inline-block"
                v-model="curRelation.props[SYSTEM_RELATION_COMMENT]"
                :rows="2"
                resize="none"
                type="textarea"
                clearable
                placeholder="关系含义"
              />
            </template>
            <template v-else>
              {{ curRelation.props[SYSTEM_RELATION_COMMENT] || '- -' }}
            </template>
          </el-descriptions-item>
        </el-descriptions>
        <div class="relation-opera" style="text-align: right">
          <el-button v-if="curRelation.isEdit" @click="cancelEdit">取消</el-button>
          <el-button type="primary" v-if="curRelation.isEdit" @click="submitRelation"
            >保存</el-button
          >
          <el-button type="primary" v-else @click="editRelation">编辑</el-button>
          <el-button type="danger" @click="delRelation">删除</el-button>
        </div>
      </div>
    </el-popover>
    <div
      class="float-info"
      :class="{ 'show-tip': showFloatInfo, 'fixed-pos': floatFixed }"
      :style="`top:${mouseY + 16 + 'px'};left:${mouseX + 10 + 'px'}`"
    >
      <div class="node-info">
        <div class="node-info__header">
          <div class="node-info__title">
            节点详情
            <span style="font-size: 0.875rem">
              （ 可通过【Alt + G】组合键切换固定或浮动此信息框 ）
            </span>
          </div>
          <div class="node-info__extra"></div>
        </div>
        <div class="node-info__body">
          <template v-for="(val, k) in hoverNode" :key="k">
            <div class="node-info__item" v-if="k === '标签'">
              <div class="node-info__label">{{ k }}：</div>
              <div class="node-info__content">
                <el-tag
                  v-for="(k, idx) in val"
                  :key="idx"
                  effect="dark"
                  style="margin: 0 0.5rem 0.5rem 0"
                >
                  {{ k }}
                </el-tag>
              </div>
            </div>
            <div class="node-info__item" v-else>
              <div class="node-info__label">{{ k }}：</div>
              <div class="node-info__content">{{ val }}</div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.vis-wrapper {
  position: relative;
}

.vis-instance {
  width: 100%;
  height: 100%;
}

.relation-place {
  position: fixed;
  width: 0;
  height: 0;
  top: v-bind(edgePosY);
  left: v-bind(edgePosX);
}

.opera-wrapper {
  position: absolute;
  top: 6.25rem;
  left: 6.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  scale: v-bind(graphScale);
  &:hover {
    animation-play-state: paused;
  }
  .opera-icon {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 2rem;
    transform-origin: center;
    background-color: var(--color-background-blur);
    transition: scale var(--starry-sky-transition-time);
    cursor: pointer;
    .el-icon {
      font-size: 1.25rem;
      font-weight: bold;
      transition: font-size var(--starry-sky-transition-time);
    }
    &:hover {
      scale: 1.1;
      .el-icon {
        font-size: 1.5rem;
      }
    }
  }
  .edit-node {
    animation: edit-node-anime var(--starry-sky-transition-time) linear;
    transform: translateX(-5rem) translateY(-5rem);
  }
  .edit-relation {
    animation: edit-relation-anime var(--starry-sky-transition-time) linear;
    transform: translateX(5rem) translateY(-5rem);
  }
  .query-relation {
    animation: query-relation-anime var(--starry-sky-transition-time) linear;
    transform: translateX(5rem) translateY(5rem);
  }
  .delete-node {
    animation: delete-node-anime var(--starry-sky-transition-time) linear;
    transform: translateX(-5rem) translateY(5rem);
  }
}

.float-info {
  position: fixed;
  top: 0;
  left: 0;
  min-width: 15rem;
  max-width: 60rem;
  max-height: 60rem;
  padding: 0.625rem;
  font: 0.875rem / 1.3125rem Microsoft YaHei;
  opacity: 0;
  visibility: hidden;
  white-space: nowrap;
  box-shadow: rgba(0, 0, 0, 0.2) 0.0625rem 0.125rem 0.625rem;
  border-radius: 0.25rem;
  background-color: var(--color-background);
  transition: opacity 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0s,
    visibility 0.2s cubic-bezier(0.23, 1, 0.32, 1) 0s;
  &.show-tip {
    opacity: 1;
    visibility: visible;
  }
  &.fixed-pos {
    top: 0 !important;
    left: 0 !important;
    width: 27rem;
    height: 100vh;
    background-color: transparent;
    transition: top var(--starry-sky-transition-time), left var(--starry-sky-transition-time);
  }
  .node-info {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    color: var(--color-text);
    font-size: 0.875rem;
  }
  .node-info__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 3rem;
    margin-bottom: 1rem;
    .node-info__title {
      font-size: 1rem;
      font-weight: 700;
    }
  }
  .node-info__body {
    height: calc(100% - 5rem);
    overflow-x: hidden;
    overflow-y: auto;
    .node-info__item {
      padding-bottom: 0.75rem;
      display: flex;
      align-items: flex-start;
    }
    .node-info__content {
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}

/* 旋转动画 */
@keyframes opera-icon-rotate {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* 编辑节点按钮动画 */
@keyframes edit-node-anime {
  0% {
    transform: none;
  }
  100% {
    transform: translateX(-5rem) translateY(-5rem);
  }
}

/* 编辑关系按钮动画 */
@keyframes edit-relation-anime {
  0% {
    transform: none;
  }
  100% {
    transform: translateX(5rem) translateY(-5rem);
  }
}

/* 查找关联节点按钮动画 */
@keyframes query-relation-anime {
  0% {
    transform: none;
  }
  100% {
    transform: translateX(5rem) translateY(5rem);
  }
}

/* 删除节点按钮动画 */
@keyframes delete-node-anime {
  0% {
    transform: none;
  }
  100% {
    transform: translateX(-5rem) translateY(5rem);
  }
}
</style>
