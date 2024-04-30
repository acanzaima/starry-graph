/* 用于管理节点的特殊节点标签 由系统内部操作生成且在查询显示时过滤这些标签 */
export const SYSTEM_STORE_NODE_LABEL = 'store_node'; // 系统使用节点标签 此标签节点用于管理需要保存的配置项
export const SYSTEM_NODE_LABELS = ['store_node'];

/* 用于管理节点的内置属性 由系统内部操作生成且在查询显示时过滤这些属性 */
export const SYSTEM_NODE_ID = 'node_id' // 节点标识
export const SYSTEM_NODE_LABEL_NAME = 'node_label' // 节点显示标签key
export const SYSTEM_NODE_NAME = 'node_name' // 节点显示名称key
export const SYSTEM_NODE_PROPERTIES = ['node_id', 'node_label', 'node_name', 'relation_comment'];

/* 用于管理节点的特殊关系类型 由系统内部操作生成且在查询显示时过滤这些关系类型 */
export const SYSTEM_RELATION_COMMENT = 'relation_comment' // 关系含义
export const SYSTEM_NODE_RELATIONS = [];