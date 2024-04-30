import { SYSTEM_NODE_LABELS, SYSTEM_NODE_LABEL_NAME, SYSTEM_NODE_NAME, SYSTEM_NODE_ID, SYSTEM_RELATION_COMMENT } from '@/config/setting';

/**
 * 查询全部标签
 * @returns cypher query result
 */
export function queryLabels () {
  return 'call db.labels'
}

/**
 * 查询全部属性
 * @returns cypher query result
 */
export function queryProperties () {
  return 'call db.propertyKeys'
}

/**
 * 查询全部关系
 * @returns cypher query result
 */
export function queryRelations () {
  return 'call db.relationshipTypes'
}

/**
 * 执行事务
 * @param {*} tx 事务 
 * @param {*} queries 语句数组
 */
export function executeTransaction(tx, queries) {
  queries.forEach((query) => {
    tx.run(query);
  });
}

/**
 * 查询图谱
 * @param { Object } params 查询参数 结构为 { labels: [], attr: '', value: '' }
 * @returns cypher query result
 */
export function queryGraph (params, limit=100) {
  let newLabel = [];
  let labels
  if (params.labels.length > 0) {
    params.labels.forEach((i) => {
      if (!SYSTEM_NODE_LABELS.includes(i)) {
        newLabel.push(i);
      }
    });
  }
  if (newLabel.length > 0) {
    labels = newLabel.join(':');
    if (params.attr && params.value) {
      return  `MATCH (n:${labels}) WHERE n.${params.attr} CONTAINS '${params.value}' OPTIONAL MATCH p=(n)-[r]->() RETURN COLLECT(DISTINCT n) AS nodes, COLLECT(p) AS edges LIMIT ${limit}`;
    } else if (!params.attr && params.value) {
      return  `MATCH (n:${labels}) WHERE n.${SYSTEM_NODE_NAME} CONTAINS '${params.value}' OPTIONAL MATCH p=(n)-[r]->() RETURN COLLECT(DISTINCT n) AS nodes, COLLECT(p) AS edges LIMIT ${limit}`;
    } else {
      return  `MATCH (n:${labels}) OPTIONAL MATCH p=(n)-[r]->() RETURN COLLECT(DISTINCT n) AS nodes, COLLECT(p) AS edges LIMIT ${limit}`;
    }
  } else {
    labels = SYSTEM_NODE_LABELS.join('&!');
    if (params.attr && params.value) {
      return  `MATCH (n:!${labels}) WHERE n.${params.attr} CONTAINS '${params.value}' OPTIONAL MATCH p=(n)-[r]->() RETURN COLLECT(DISTINCT n) AS nodes, COLLECT(p) AS edges LIMIT ${limit}`;
    } else if (!params.attr && params.value) {
      return  `MATCH (n:!${labels}) WHERE n.${SYSTEM_NODE_NAME} CONTAINS '${params.value}' OPTIONAL MATCH p=(n)-[r]->() RETURN COLLECT(DISTINCT n) AS nodes, COLLECT(p) AS edges LIMIT ${limit}`;
    }  else {
      return  `MATCH (n:!${labels}) OPTIONAL MATCH p=(n)-[r]->() RETURN COLLECT(DISTINCT n) AS nodes, COLLECT(p) AS edges LIMIT ${limit}`;
    }
  }
}

/**
 * 按标签查询节点
 * @param { Array } label 标签
 * @param { Number } limit 返回数量
 * @returns cypher query result
 */
export function queryNode(label = [], limit = 100) {
  if (label.length > 0) {
    let newLabel = [];
    label.forEach((i) => {
      if (!SYSTEM_NODE_LABELS.includes(i)) {
        newLabel.push(i);
      }
    });
    let labels = newLabel.join(':');
    return `MATCH (n:${labels}) RETURN n LIMIT ${limit}`;
  } else {
    let labels = SYSTEM_NODE_LABELS.join('&!');
    return `MATCH (n:!${labels}) RETURN n LIMIT ${limit}`;
  }
}

/**
 * 按ID和节点名称查询节点
 * @param { String } query ID或节点名称
 * @param { Number } limit 返回数量
 * @returns cypher query result
 */
export function queryNodeByIdName (query, limit = 7) {
  /* 数字用id匹配 否则用名称匹配 */
  if (/^\d{1,}$/g.test(query)) {
    return `MATCH (n) WHERE id(n) = ${query} RETURN n LIMIT ${limit}`
  } else {
    return `MATCH (n) WHERE n.${SYSTEM_NODE_NAME} contains '${query}' RETURN n LIMIT ${limit}`
  }
}

/**
 * 按ID查询直接关联节点
 * @param { String } id id
 * @param { Number } limit 返回数量
 * @returns cypher query result
 */
export function queryRelatedNodeById (id, limit = 100) {
  return `MATCH p=(n)-[r]-(m) WHERE ID(n) = ${id} RETURN COLLECT(DISTINCT m) AS nodes, COLLECT(p) AS edges LIMIT ${limit}`
}

/**
 * 查询关系
 * @param { Array } relation 关系数组
 * @param { Number } limit 返回数量
 * @returns cypher query result
 */
export function queryRelation(relation = [], limit = 200) {
  let labels = SYSTEM_NODE_LABELS.join('&!');
  if (relation.length > 0) {
    let relations = relation.join(':');
    return `MATCH p=(n:!${labels})-[r:${relations}]->() RETURN p LIMIT ${limit}`;
  } else {
    return `MATCH p=(n:!${labels})-->() RETURN p LIMIT ${limit}`;
  }
}

/**
 * 新增节点
 * @param { Array } attrs 节点属性数组
 * @returns cypher query result
 */
export function operaAddNode (attrs) {
  let labels
  let attrMap = {}
  attrs.forEach((i, idx) => {
    if (idx === 0) {
      /* 处理标签 */
      if (i.value.length > 0) {
        labels = i.value.filter(j => !(SYSTEM_NODE_LABELS.includes(j)))
      }
    } else if (idx === 1) {
      /* 处理节点名 */
      attrMap[SYSTEM_NODE_NAME] = i.value
      attrMap[i.label] = i.value
    } else {
      /* 排除空值项 */
      if (i.label && i.value) {
        attrMap[i.label] = i.value
      }
    }
  })
  let attrMapToCypher = []
  for (let k in attrMap) {
    attrMapToCypher.push(`${k}: '${attrMap[k]}'`)
  }
  if (labels) {
    return `CREATE(n:${labels.join(':')} {${attrMapToCypher.join(',')}})`;
  } else {
    return `CREATE(n {${attrMapToCypher.join(',')}})`;
  }
}

/**
 * 编辑节点
 * @param { Number } node 节点详情
 * @param { Array } attrs 节点属性数组
 * @returns cypher query result
 */
export function operaEditNode (node, attrs) {
  let labels
  let attrMap = {}
  attrs.forEach((i, idx) => {
    if (idx === 0) {
      /* 处理标签 */
      if (i.value.length > 0) {
        labels = i.value.filter(j => !(SYSTEM_NODE_LABELS.includes(j)))
      }
    } else if (idx === 1) {
      /* 处理节点名 */
      attrMap[SYSTEM_NODE_NAME] = i.value
      attrMap[i.label] = i.value
    } else {
      /* 排除空值项 */
      if (i.label && i.value) {
        attrMap[i.label] = i.value
      }
    }
  })
  let attrMapToCypher = []
  for (let k in attrMap) {
    attrMapToCypher.push(`n.${k} = '${attrMap[k]}'`)
  }
  let oldLabels = node[SYSTEM_NODE_LABEL_NAME]
  let oldAttrs = []
  let excludeProp = [ SYSTEM_NODE_LABEL_NAME, SYSTEM_NODE_ID ]
  for (let k in node) {
    if (!(excludeProp.includes(k))) {
      oldAttrs.push(`n.${k}`)
    }
  }
  if (labels) {
    return [
      `MATCH (n) WHERE id(n) = ${node[SYSTEM_NODE_ID]} REMOVE n:${oldLabels.join(',n:')}, ${oldAttrs.join(',')}`,
      `MATCH (n) WHERE id(n) = ${node[SYSTEM_NODE_ID]} SET n:${labels.join(':')}, ${attrMapToCypher.join(',')}`
    ]
  } else {
    return [
      `MATCH (n) WHERE id(n) = ${node[SYSTEM_NODE_ID]} REMOVE n:${oldLabels.join(',n:')}, ${oldAttrs.join(',')}`,
      `MATCH (n) WHERE id(n) = ${node[SYSTEM_NODE_ID]} SET ${attrMapToCypher.join(',')}`
    ]
  }
}

/**
 * 删除节点
 * @param { Number } id 节点id
 * @returns cypher query result
 */
export function operaDeleteNode (id) {
  return `MATCH (n) WHERE id(n) = ${id} DETACH  DELETE n`
}

/**
 * 创建节点关系
 * @param { Object } info 节点关系信息 { from: node-id, relation: '关系名称', comment: '关系含义', target: node-id }
 * @returns cypher query result
 */
export function operaCreateRelation (info) {
  if (info.comment) {
    return `MATCH (m),(n) WHERE id(m) = ${info.from} AND id(n) = ${info.target} CREATE (m)-[r:${info.relation} { ${SYSTEM_RELATION_COMMENT}: '${info.comment}' } ]->(n)`
  } else {
    return `MATCH (m),(n) WHERE id(m) = ${info.from} AND id(n) = ${info.target} CREATE (m)-[r:${info.relation}]->(n)`
  }
}

/**
 * 编辑节点关系
 * @param { Object } info 节点关系信息 { from: node-id, [SYSTEM_NODE_ID]: '关系id', label: '关系名称', [SYSTEM_RELATION_COMMENT]: '关系含义', to: node-id }
 * @returns cypher query result
 */
export function operaEditRelation (info) {
  if ('label' in info) {
    return [`MATCH ()-[r]->() WHERE id(r) = ${info[SYSTEM_NODE_ID]} DELETE r`, `MATCH (m),(n) WHERE id(m) = ${info.from} AND id(n) = ${info.to} CREATE (m)-[r:${info.label} { ${SYSTEM_RELATION_COMMENT}: '${info[SYSTEM_RELATION_COMMENT]}' }]->(n)`]
  } else {
    return [`MATCH ()-[r]->() WHERE id(r) = ${info[SYSTEM_NODE_ID]} SET r.${SYSTEM_RELATION_COMMENT} = '${info[SYSTEM_RELATION_COMMENT]}'`]
  }
}

/**
 * 删除关系
 * @param { Number } id 关系id
 * @returns cypher query result
 */
export function operaDeleteEdge (id) {
  return `MATCH ()-[r]->() WHERE id(r) = ${id} DELETE r`
}


export default {
  queryLabels,
  queryProperties,
  queryRelations,
  executeTransaction,
  queryGraph,
  queryNode,
  queryNodeByIdName,
  queryRelatedNodeById,
  queryRelation,
  operaAddNode,
  operaEditNode,
  operaDeleteNode,
  operaCreateRelation,
  operaEditRelation,
  operaDeleteEdge
};
