import { deepMix, isPlainObject, isString } from '@antv/util'
import EventEmitter from 'eventemitter3'
import { Canvas, Group } from '../g-lite'
import {
  GraphData,
  IGraph,
  IGroupOptions,
  IPriveteGroupOptions,
  ITEM_TYPE,
} from './interface/graph'
import { EventController } from './controller/event'
import { ItemController } from './controller/item'
import { LayoutController } from './controller/layout'
import { StateController } from './controller/state'
import { ViewController } from './controller/view'
import { IEdge, INode, IItem } from './interface/item'
import { EdgeConfig, ModelConfig, NodeConfig, UpdateType } from './interface/shape'
import { globalConstants } from './interface/constant'
import { Renderer } from '../g-canvas'
import { IPoint } from './interface/type'
import { Plugin as DragDrogPlugin } from '../g-plugin-dragndrop'
import { GEvent, GEventName } from './interface/event'
import { BehaviorController } from './controller/behavior'
import { registerAllInnerBehavior } from './behavior/registerBehavior'
import { registerAllInnerNodeAndEdge } from './element/register'
export class Graph implements IGraph {
  protected cfg: IGroupOptions & { [key: string]: any }

  constructor(cfg: IGroupOptions) {
    registerAllInnerBehavior()
    registerAllInnerNodeAndEdge()

    this.cfg = deepMix(this.getDefaultCfg(), cfg)
    this.init()
  }

  protected init() {
    const emitter = new EventEmitter()
    this.set('emitter', emitter)

    this.initCanvas()
    this.initGroup()

    const viewController = new ViewController(this)
    const itemController = new ItemController(this)
    const stateController = new StateController(this)
    const layoutController = new LayoutController(this)
    const eventController = new EventController(this)
    const behaviorController = new BehaviorController(this)

    this.set({
      viewController,
      itemController,
      stateController,
      layoutController,
      eventController,
      behaviorController,
    })
  }

  protected initGroup(): void {
    const canvas: Canvas = this.get('canvas')

    if(!canvas) {
      return 
    }
    const group = new Group({
      id: globalConstants.graphRootId,
      className: globalConstants.rootContainerClassName,
    })

    canvas.appendChild(group)

    this.set('group', group)
    return 
  }

  protected initCanvas() {
    let container: string | HTMLElement | Element | null = this.get('container')
    if (typeof container === 'string') {
      container = document.getElementById(container)
      this.set('container', container)
    }
    if (!container) {
      console.log('Init canvas with invalid container! Please check g-graph!')
      return null
    }
    const { clientWidth, clientHeight } = container
    const width: number = this.get('width') || clientWidth
    const height: number = this.get('height') || clientHeight

    if (!this.get('width') && !this.get('height')) {
      this.set('width', clientWidth)
      this.set('height', clientHeight)
    }

    const canvasRenderer = new Renderer({
      // enableDirtyCheck: false,
      // enableCulling: false,
      enableDirtyRectangleRendering: false,
      // enableDirtyRectangleRenderingDebug: true,
    })

    canvasRenderer.registerPlugin(
      new DragDrogPlugin({
        isDocumentDroppable: true,
        isDocumentDraggable: true,
      })
    )

    const canvasCfg: any = {
      container,
      width,
      height,
      renderer: canvasRenderer,
    }
    const canvas = new Canvas(canvasCfg)
    this.set('canvas', canvas)
    return null
  }

  public on<T = GEvent>(
    eventName: GEventName,
    callback: (e: T) => void,
    once?: boolean | undefined
  ) {
    const emitter: EventEmitter = this.get('emitter')
    if (once) {
      emitter.once(eventName, callback)
    } else {
      emitter.on(eventName, callback)
    }
    return this
  }

  public off<T = GEvent>(
    eventName: GEventName,
    callback: (e: T) => void,
    once?: boolean | undefined
  ) {
    const emitter: EventEmitter = this.get('emitter')
    emitter.off(eventName, callback, undefined, once)
    return this
  }

  public emit(evt: string, ...args: any[]) {
    const emitter: EventEmitter = this.get('emitter')
    emitter.emit(evt, ...args)
    return this
  }

  /**
   * 获取当前图中所有节点的item实例
   * @return {INode} item数组
   */
  public getNodes(): INode[] {
    return this.get('nodes')
  }

  /**
   * 获取当前图中所有边的item实例
   * @return {IEdge} item数组
   */
  public getEdges(): IEdge[] {
    return this.get('edges')
  }

  /**
   * 设置视图初始化数据
   * @param {GraphData} data 初始化数据
   */
  public data(data?: GraphData): void {
    this.set('data', data)
  }

  public render() {
    const data: GraphData = this.get('data')

    const { nodes = [], edges = [] } = data
    this.addItems(nodes.map((node) => ({ type: 'node', model: node })))
    this.addItems(edges.map((edge) => ({ type: 'edge', model: edge })))
  }

  addItem: (type: ITEM_TYPE, model: ModelConfig) => IItem | boolean

  public addItems(items: { type: ITEM_TYPE; model: ModelConfig }[]): (IItem | boolean)[] {
    const itemController: ItemController = this.get('itemController')

    const returnItems: (IItem | boolean)[] = []

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type !== 'edge') {
        returnItems.push(this.innerAddItem(item.type, item.model, itemController))
      } else {
        returnItems.push(false)
      }
    }

    // 2. add all the edges
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type === 'edge') {
        returnItems[i] = this.innerAddItem(item.type, item.model, itemController)
      }
    }
    return returnItems
  }

  /**
   * 获取 this.cfg 中的值
   * @param key 键
   */
  public get(key: string) {
    return this.cfg?.[key]
  }

  /**
   * 将值设置到 this.cfg 变量上面
   * @param key 键 或 对象值
   * @param val 值
   */
  public set<T = any>(key: string | object, val?: T): Graph {
    if (isPlainObject(key)) {
      this.cfg = { ...this.cfg, ...key }
    } else {
      this.cfg[key] = val
    }
    return this
  }

  /**
   * 设置元素状态
   * @param {IItem} item 元素id或元素实例
   * @param {string} state 状态名称
   * @param {string | boolean} value 是否启用状态 或 状态值
   */
  public setItemState(item: IItem | string, state: string, value: string | boolean): void {
    if (isString(item)) {
      item = this.findById(item as string)
    }

    const itemController: ItemController = this.get('itemController')
    itemController.setItemState(item, state, value)

    const stateController: StateController = this.get('stateController')
    stateController.updateState(item, state, value)
  }

  /**
   * 清理元素多个状态
   * @param {string|IItem} item 元素id或元素实例
   * @param {string[]} states 状态
   */
  public clearItemStates(item: IItem | string, states?: string[] | string): void {
    if (isString(item)) {
      item = this.findById(item)
    }

    const itemController: ItemController = this.get('itemController')

    if (!states) {
      states = item.get<string[]>('states')
    }

    itemController.clearItemStates(item, states)

    const stateController: StateController = this.get('stateController')
    stateController.updateStates(item, states, false)
  }

  /**
   * 更新元素
   * @param {IItem} item 元素id或元素实例
   * @param {Partial<NodeConfig> | EdgeConfig} cfg 需要更新的数据
   */
  public updateItem(
    item: IItem | string,
    cfg: Partial<NodeConfig> | EdgeConfig,
    updateType?: UpdateType
  ): void {
    const itemController: ItemController = this.get('itemController')
    let currentItem: IItem
    if (isString(item)) {
      currentItem = this.findById(item as string)
    } else {
      currentItem = item
    }
    itemController.updateItem(currentItem, cfg, updateType)
  }

  /**
   * 自动重绘
   * @internal 仅供内部更新机制调用，外部根据需求调用 render 或 paint 接口
   */
  public autoPaint(): void {
    if (this.get('autoPaint')) {
      this.paint()
    }
  }

  /**
   * 设置是否在更新/刷新后自动重绘
   * @param {boolean} auto 自动重绘
   */
  public setAutoPaint(auto: boolean): void {
    const self = this
    self.set('autoPaint', auto)
  }

  /**
   * 仅画布重新绘制
   */
  public paint(): void {
    this.emit('beforepaint')
    this.get('canvas').draw()
    this.emit('afterpaint')
  }

  public getDefaultCfg(): Partial<IPriveteGroupOptions> {
    return {
      /**
       * Container could be dom object or dom id
       */
      container: undefined,

      /**
       * Canvas width
       * unit pixel if undefined force fit width
       */
      width: undefined,

      /**
       * Canvas height
       * unit pixel if undefined force fit height
       */
      height: undefined,
      /**
       * source data
       */
      data: {},
      /**
       * Minimum scale size
       */
      minZoom: 0.02,
      /**
       * Maxmum scale size
       */
      maxZoom: 10,
      zoom: 1,
      /**
       * when data or shape changed, should canvas draw automatically
       */
      autoPaint: true,

      /**
       * 默认的节点配置，data 上定义的配置会覆盖这些配置。例如：
       * defaultNode: {
       *  type: 'rect',
       *  size: [60, 40],
       *  style: {
       *    //... 样式配置项
       *  }
       * }
       * 若数据项为 { id: 'node', x: 100, y: 100 }
       * 实际创建的节点模型是 { id: 'node', x: 100, y: 100， type: 'rect', size: [60, 40] }
       * 若数据项为 { id: 'node', x: 100, y: 100, type: 'circle' }
       * 实际创建的节点模型是 { id: 'node', x: 100, y: 100， type: 'circle', size: [60, 40] }
       */
      defaultNode: {},
      /**
       * 默认边配置，data 上定义的配置会覆盖这些配置。用法同 defaultNode
       */
      defaultEdge: {},
      /**
       * all the instances indexed by id
       */
      itemMap: {},
      nodes: [],
      edges: [],
      destroyed: false,
    }
  }

  /**
   * 根据 ID 查询图元素实例
   * @param id 图元素 ID
   */
  public findById(id: string): IItem {
    return this.get('itemMap')[id]
  }

  /**
   * 伸缩窗口
   * @param zoom
   * @param center 以center的x, y坐标为中心缩放
   */
  public zoom(zoom: number, center?: IPoint, min?: number, max?: number) {
    const minZoom: number = min ?? this.get('minZoom')
    const maxZoom: number = max ?? this.get('maxZoom')
    let targetZoom = zoom

    if (minZoom && targetZoom < minZoom) {
      targetZoom = minZoom
    } else if (maxZoom && targetZoom > maxZoom) {
      targetZoom = maxZoom
    }

    const canvas: Canvas = this.get('canvas')

    const camera = canvas.getCamera()

    if (center) {
      camera.setZoomByViewportPoint(targetZoom, [center.x, center.y])
    } else {
      camera.setZoom(targetZoom)
    }

    this.set('zoom', targetZoom)
  }

  /**
   * 平移画布
   * @param dx 水平方向位移
   * @param dy 垂直方向位移
   */
  public translate(dx: number, dy: number): void {
    const canvas: Canvas = this.get('canvas')
    const zoom = this.get('zoom')
    const camera = canvas.getCamera()
    // 相机移动和画布相反
    camera.pan(-dx / zoom, -dy / zoom)
  }

  /**
   * Move the graph to destination under viewport coordinates.
   * @param destination destination under viewport coordinates.
   * @param effectTiming animation configurations
   */
  public async translateTo(dx: number, dy: number) {
    const { x: cx, y: cy } = this.getViewportCenter()
    this.translate(cx - dx, cy - dy)
  }

  public changeSize(width: number, height: number) {
    const canvas: Canvas = this.get('canvas')
    canvas.resize(width, height)
    return this
  }

  public getZoom() {
    return this.get('zoom')
  }

  /**
   * Fit the graph center to the view center.
   */
  public async fitCenter() {
    const canvas: Canvas = this.get('canvas')
    // Get the bounds of the whole graph.
    const {
      center: [graphCenterX, graphCenterY],
    } = canvas.document.documentElement.getBounds()
    const { x, y } = canvas.canvas2Viewport({ x: graphCenterX, y: graphCenterY })
    this.translateTo(x, y)
  }

  /**
   * Fit the graph content to the view.
   */
  public fitView() {
    const [top, right, bottom, left] = [0, 0, 0, 0]
    const canvas: Canvas = this.get('canvas')
    // Get the bounds of the whole graph.
    const {
      center: [graphCenterX, graphCenterY],
      halfExtents,
    } = canvas.document.documentElement.getBounds()
    const origin = canvas.canvas2Viewport({
      x: graphCenterX,
      y: graphCenterY,
    })
    const { width: viewportWidth, height: viewportHeight } = canvas.getConfig()

    const graphWidth = halfExtents[0] * 2
    const graphHeight = halfExtents[1] * 2
    const tlInCanvas = canvas.viewport2Canvas({ x: left, y: top })
    const brInCanvas = canvas.viewport2Canvas({
      x: viewportWidth! - right,
      y: viewportHeight! - bottom,
    })

    const targetViewWidth = brInCanvas.x - tlInCanvas.x
    const targetViewHeight = brInCanvas.y - tlInCanvas.y

    const wRatio = targetViewWidth / graphWidth
    const hRatio = targetViewHeight / graphHeight

    const ratio = Math.min(wRatio, hRatio)

    this.translate(viewportWidth! / 2 - origin.x, viewportHeight! / 2 - origin.y)
    this.zoom(ratio * this.get('zoom'))
  }

  /**
   * 销毁画布
   */
  public destroy() {
    this.clear()

    this.get('itemController')?.destroy()
    this.get('modeController')?.destroy()
    this.get('viewController')?.destroy()
    this.get('stateController')?.destroy()
    this.get('eventController')?.destroy()
    this.get('behaviorController')?.destroy()

    this.get('canvas')?.destroy()
    ;(this.cfg as any) = null
    this.set('destroyed', true)
  }

  /**
   * 清除画布元素
   * @return {object} this
   */
  public clear(avoidEmit: boolean = false): IGraph {
    ;(this.get('canvas') as Canvas)?.destroy()

    // 清空画布时同时清除数据
    this.set({
      itemMap: {},
      nodes: [],
      edges: [],
      groups: [],
    })
    if (!avoidEmit) this.emit('afterrender')
    return this
  }

  public getViewportCenter(): IPoint {
    const canvas: Canvas = this.get('canvas')
    const { width, height } = canvas.getConfig()
    return { x: width! / 2, y: height! / 2 }
  }

  public setCanvasDraggable(draggable: boolean) {
    this.set('canvasDraggable', draggable)
    const eventController: EventController = this.get('eventController')
    eventController.setCanvasDraggable(draggable)
  }

  public setCanvasWheelZoom(zoomable: boolean) {
    this.set('canvasWheelZoom', zoomable)
    const eventController: EventController = this.get('eventController')
    eventController.setCanvasWheelZoom(zoomable)
  }

  private innerAddItem(
    type: ITEM_TYPE,
    model: ModelConfig,
    itemController: ItemController
  ): IItem | boolean {
    const item = itemController.addItem(type, model)
    return item
  }
}
