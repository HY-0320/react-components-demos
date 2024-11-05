import { AllShapeStyle, Group } from '../../g-lite'
import { DisplayObject } from '../../g-lite'
import { IItem } from './item'

export interface ArrowConfig {
  lineWidth?: number
  path?: string
  stroke?: string
  fill?: string
  lineDash?: number[]
  strokeOpacity?: number
  opacity?: number
  fillOpacity?: number
  /**
   * 偏移量，见：https://g-next.antv.vision/api/basic/line#markerend
   * markerStartOffset 和 markerEndOffset
   */
  endOffset?: number
}

// Shape types
export type ShapeStyle = Partial<AllShapeStyle>

export type ModelStyle = Partial<{
  [key: string]: unknown
  style: ShapeStyle
}>

export interface ModelConfig extends ModelStyle {
  id?: string
  // 节点或边的类型
  type?: string
  // 每种节点会有不同的形态
  nodeType?: string
  x?: number
  y?: number
  size?: number | number[]
  color?: string
  anchorPoints?: number[][]
  startPoint?: {
    x: number
    y: number
  }
  endPoint?: {
    x: number
    y: number
  }
  visible?: boolean
  endArrow?: boolean | ArrowConfig
  /**
   * 节点指标数据
   * */
  metrics?: MetricInfo[]
   /**
   * 是否显示指标名
   * */
  showMetricName?: boolean
  /**
   * 是否展示lael名
  */
  showLabel?: boolean
}

export interface MetricInfo {
  name: string, // 指标名
  value: number // 指标值
  /* 最小值和最大值 用作处理指标值所占比例 */
  min?: number, // 最小值 默认0
  max?: number, // 最大值 默认100
  baseColor?: string, // 基准颜色 阈值模式下生效
  strokeColor?: string, // 当前值对应颜色
}

export interface NodeConfig extends ModelConfig {
  id: string
}

export interface EdgeConfig extends ModelConfig {
  id?: string
  source?: string
  target?: string
  sourceNode?: Node
  targetNode?: Node
}

export type UpdateType = 'move' | 'bbox' | 'style' | 'bbox|label' | 'style|label' | undefined

export type ShapeDefine = string | ((cfg: ModelConfig) => string)

export type ShapeOptions = Partial<{
  options: ModelConfig
  /**
   * 形状的类型，例如 circle，ellipse，polyline...
   */
  type: string

  itemType: string
  shapeType: string
  [key: string]: any

  /**
   * 绘制
   */
  draw: (cfg: ModelConfig, group: Group, item: IItem) => DisplayObject
  drawShape: (cfg?: ModelConfig, group?: Group) => DisplayObject
  /**
   * 绘制完成后的操作，便于用户继承现有的节点、边
   */
  afterDraw: (cfg: ModelConfig, group: Group, item: IItem, rst?: DisplayObject) => void
  /**
   * 仅更新为位置信息
   */
  updatePosition: (cfg: ModelConfig, group: Group, item: IItem) => DisplayObject
  /**
   * 绘制完成后的操作，便于用户继承现有的节点、边
   */
  afterUpdatePosition: (cfg: ModelConfig, group: Group, item: IItem, rst?: DisplayObject) => void
  setState: (name: string, value: string | boolean, item: IItem) => void
}>

export interface IShapeFactory {
  defaultShapeType: string
  /**
   * 形状的 className，用于搜索
   * @type {String}
   */
  className: null | string
  /**
   * 获取绘制 Shape 的工具类，无状态
   * @param  {String} type 类型
   * @return {Shape} 工具类
   */
  getShape: (type?: string) => ShapeOptions

  /**
   * 绘制图形
   * @param  {String} type  类型
   * @param  {Object} cfg 配置项
   * @param  {G.Group} group 图形的分组
   * @return {IShape} 图形对象
   */
  draw: (type: string, cfg: ModelConfig, group: Group, item: IItem) => DisplayObject
  /**
   * 更新
   * @param  {String} type  类型
   * @param  {Object} cfg 配置项
   * @param  {G6.Item} item 节点、边、分组等
   */
  baseUpdatePosition: (type: string, cfg: ModelConfig, group: Group, item: IItem) => void
  /**
   * 设置状态
   * @param {String} type  类型
   * @param {String} name  状态名
   * @param {String | Boolean} value 状态值
   * @param {G6.Item} item  节点、边、分组等
   */
  setState: (type: string, name: string, value: string | boolean, item: IItem) => void
  /**
   * 是否允许更新，不重新绘制图形
   * @param  {String} type 类型
   * @return {Boolean} 是否允许使用更新
   */
  shouldUpdatePosition: (type: string) => boolean
}
