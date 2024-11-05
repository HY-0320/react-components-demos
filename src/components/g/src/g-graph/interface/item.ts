import { DisplayObject, Group } from '../../g-lite'
import { ITEM_TYPE } from './graph'
import { ModelConfig, UpdateType } from './shape'
import { IPoint, Indexable } from './type'

export interface IItemBase {
  destroyed: boolean
  /**
   * 节点类型
   * @return {string} 节点的类型
   */
  getType: () => ITEM_TYPE
  /**
   * 获取 Item 的ID
   */
  getID: () => string
  /**
   * 获取当前元素的所有状态
   * @return {Array} 元素的所有状态
   */
  getStates: () => string[]
  /**
   * 当前元素是否处于某状态
   * @param {String} state 状态名
   * @return {Boolean} 是否处于某状态
   */
  hasState: (state: string) => boolean
  /**
   * 更改元素状态， visible 不属于这个范畴
   * @internal 仅提供内部类 graph 使用
   * @param {String} state 状态名
   * @param {Boolean} value 节点状态值
   */
  setState: (state: string, value: string | boolean) => void
  clearStates: (states?: string | string[]) => void
  /**
   * 将更新应用到 model 上，刷新属性
   * @internal 仅提供给 Graph 使用，外部直接调用 graph.update 接口
   * @param  {Object} cfg       配置项，可以是增量信息
   * @param  {boolean} updateType 更新的类型，'move' 代表仅移动
   */
  update: (cfg: ModelConfig, updateType?: UpdateType) => void
  /**
   * 显示元素
   */
  show: () => void

  /**
   * 隐藏元素
   */
  hide: () => void

  get: <T = any>(key: string) => T
  set: <T = any>(key: string, value: T) => void
}

export interface IEdge extends IItemBase {
  setSource: (source: INode) => void
  setTarget: (target: INode) => void
  getSource: () => INode
  getTarget: () => INode
}

export interface INode extends IItemBase {
  /**
   * 获取从节点关联的所有边
   * @return {Array} 边的集合
   */
  getEdges: () => IEdge[]
  /**
   * 添加边
   * @param {Edge} edge 边
   */
  addEdge: (edge: IEdge) => void

  /**
   * 移除边
   * @param {Edge} edge 边
   */
  removeEdge: (edge: IEdge) => void
  /**
   * 获取节点所有的邻居节点
   *
   * @returns {INode[]}
   * @memberof INode
   */
  getNeighbors: (type?: 'source' | 'target' | undefined) => INode[]
  /**
   * 获取连接点
   * @param {Object} point 节点外面的一个点，用于计算交点、最近的锚点
   * @return {Object} 连接点 {x,y}
   */
  getLinkPoint: (point: IPoint) => IPoint | null
  /**
   * 获取节点中心点
   * @returns
   */
  getPosition: () => IPoint
}

export type IItem = INode | IEdge

export interface States {
  [key: string]: IItem[]
}

export type IItemBaseConfig = Partial<{
  /**
   * id
   */
  id: string

  /**
   * 类型
   */
  type: 'item' | 'node' | 'edge'

  /**
   * data model
   */
  model: ModelConfig

  /**
   * G Group
   */
  group: Group

  /**
   * is open animate
   */
  animate: boolean

  /**
   * visible - not group visible
   */
  visible: boolean

  /**
   * locked - lock node
   */
  locked: boolean
  /**
   * capture event
   */
  event: boolean
  /**
   * key shape to calculate item's bbox
   */
  keyShape: DisplayObject
  /**
   * item's states, such as selected or active
   * @type Array
   */
  states: string[]

  source: string | IItem
  target: string | IItem
}> &
  Indexable<any>

export interface ItemMap {
  [key: string]: IItem
}
