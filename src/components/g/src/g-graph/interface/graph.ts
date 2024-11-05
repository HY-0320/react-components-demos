import type EventEmitter from 'eventemitter3'
import { Canvas, Group } from '../../g-lite'
import { EdgeConfig, ModelConfig, ModelStyle, NodeConfig, UpdateType } from './shape'
import { IEdge, INode, IItem, ItemMap, States } from './item'
import { ItemController } from '../controller/item'
import { LayoutController } from '../controller/layout'
import { StateController } from '../controller/state'
import { ViewController } from '../controller/view'
import { EventController } from '../controller/event'
import { IPoint } from './type'
import { GEvent, GEventName } from './event'
import { BehaviorConfig } from './behavior'

export type ITEM_TYPE = 'node' | 'edge'

export interface GraphData {
  nodes?: NodeConfig[]
  edges?: EdgeConfig[]
  [key: string]: any
}

export interface IGraph<T = IPriveteGroupOptions> {
  get: <K extends keyof T>(key: K) => NonNullable<T[K]>
  set: <K extends keyof T>(key: K | Partial<T>, value?: T[K]) => IGraph
  /**
   * 设置视图初始化数据
   * @param {GraphData} data 初始化数据
   */
  data: (data?: GraphData) => void

  /**
   * 获取当前图中所有节点的item实例
   */
  getNodes: () => any[]

  /**
   * 获取当前图中所有边的item实例
   */
  getEdges: () => any[]
  /**
   * 改变画布大小
   * @param  {number} width  画布宽度
   * @param  {number} height 画布高度
   * @return {Graph} this
   */
  changeSize: (width: number, height: number) => IGraph
  /**
   * 获取当前视口伸缩比例
   * @return {number} 比例
   */
  getZoom: () => number
  /**
   * 监听函数
   */
  on: <T = GEvent>(eventName: GEventName, callback: (e: T) => void, once?: boolean) => this
  /**
   * 移除指定的监听函数
   */
  off: <T = GEvent>(eventName: GEventName, callback: (e: T) => void, once?: boolean) => this

  emit: (evt: string, ...args: any[]) => this

  findById: (id: string) => IItem
  /**
   * 根据data接口的数据渲染视图
   */
  render: () => void
  /**
   * 新增元素
   * @param {string} type 元素类型(node | edge)
   * @param {ModelConfig} model 元素数据模型
   * @return {IItem | boolean} 元素实例
   */
  addItem: (
    type: ITEM_TYPE,
    model: ModelConfig,
    stack?: boolean,
    sortCombo?: boolean
  ) => IItem | boolean
  /**
   * Adds multiple items with a single operation
   * @param {{type: ITEM_TYPE, model: ModelConfig}[]} items Items to be added to the graph
   * @return {(IItem | boolean)[]} Instance of the added items or a boolean set to false to signal that the input node was not added
   */
  addItems: (items: { type: ITEM_TYPE; model: ModelConfig }[]) => (IItem | boolean)[]
  /**
   * 设置元素状态
   * @param {IItem} item 元素id或元素实例
   * @param {string} state 状态名称
   * @param {boolean} value 是否启用状态或状态值
   */
  setItemState: (item: IItem | string, state: string, value: string | boolean) => void
  /**
   * 清理元素多个状态
   * @param {string|IItem} item 元素id或元素实例
   * @param {string | string[]} states 状态
   */
  clearItemStates: (item: IItem | string, states?: string | string[]) => void
  /**
   * 更新元素
   * @param {IItem} item 元素id或元素实例
   * @param {EdgeConfig | NodeConfig} cfg 需要更新的数据
   */
  updateItem: (
    item: IItem | string,
    cfg: Partial<NodeConfig> | EdgeConfig,
    updateType?: UpdateType
  ) => void
  /**
   * 自动重绘
   */
  autoPaint: () => void
  /**
   * 仅画布重新绘制
   */
  paint: () => void
  /**
   * 设置是否在更新/刷新后自动重绘
   * @param {boolean} auto 自动重绘
   */
  setAutoPaint: (auto: boolean) => void
  /**
   * 清除画布元素
   */
  clear: (avoidEmit?: boolean) => IGraph
  /**
   * 销毁画布
   */
  destroy: () => void
  translate: (dx: number, dy: number) => void
  zoom: (zoom: number, center?: IPoint, min?: number, max?: number) => void
  fitCenter: () => void
  fitView: () => void

  setCanvasDraggable: (draggable: boolean) => void
  setCanvasWheelZoom: (zoomable: boolean) => void
}

export interface LayoutConfig {
  type?: string
  [key: string]: unknown
}

export interface IGroupOptions {
  /**
   * 图的 DOM 容器，可以传入该 DOM 的 id 或者直接传入容器的 HTML 节点对象
   */
  container: string | HTMLElement
  layout?: LayoutConfig
  data?: GraphData
  /**
   * 指定画布宽度，单位为 'px'，可选，默认为容器宽度
   */
  width?: number
  /**
   * 指定画布高度，单位为 'px'，可选，默认为容器宽度
   */
  height?: number

  fitView?: boolean

  fitCenter?: boolean
  /**
   * 当图中元素更新，或视口变换时，是否自动重绘。建议在批量操作节点时关闭，以提高性能，完成批量操作后再打开，参见后面的 setAutoPaint() 方法。
   * 默认值：true
   */
  autoPaint?: boolean
  /**
   * 默认状态下节点的配置，比如 type, size, color。会被写入的 data 覆盖。
   */
  defaultNode?: Partial<{
    type: string
    size: number | number[]
    color: string
  }> &
    ModelStyle

  /**
   * 默认状态下边的配置，比如 type, size, color。会被写入的 data 覆盖。
   */
  defaultEdge?: Partial<{
    type: string
    size: number | number[]
    color: string
  }> &
    ModelStyle

  /**
   * 最小缩放比例
   * 默认值 0.2
   */
  minZoom?: number
  /**
   * 最大缩放比例
   * 默认值 10
   */
  maxZoom?: number
  /**
   * 画布是否支持拖拽，默认false
   */
  canvasDraggable?: boolean
  /**
   * 画布是否支持鼠标滚轮缩放
   */
  canvasWheelZoom?: boolean
  /**
   * 行为模式
   */
  behaviors?: BehaviorConfig[]
}

export interface IPriveteGroupOptions extends IGroupOptions {
  canvas: Canvas
  emitter: EventEmitter
  states: States
  viewController: ViewController
  itemController: ItemController
  stateController: StateController
  layoutController: LayoutController
  eventController: EventController
  group: Group
  itemMap: ItemMap
  nodes: INode[]
  edges: IEdge[]
  destroyed: boolean
  zoom: number
}
