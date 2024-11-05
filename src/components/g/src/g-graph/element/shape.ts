import { upperFirst } from '@antv/util'
import { ShapeOptions, ModelConfig, IShapeFactory } from '../interface/shape'
import { DisplayObject, Group } from '../../g-lite'
import { IItem } from '../interface/item'

const cache: {
  [key: string]: string
} = {} // ucfirst 开销过大，进行缓存

// 首字母大写
function ucfirst(str: string) {
  if (!cache[str]) {
    cache[str] = upperFirst(str)
  }
  return cache[str]
}

/**
 * 工厂方法的基类
 * @type Shape.FactoryBase
 */
export const ShapeFactoryBase: IShapeFactory = {
  /**
   * 默认的形状，当没有指定/匹配 shapeType 时，使用默认的
   * @type {String}
   */
  defaultShapeType: 'defaultType',
  /**
   * 形状的 className，用于搜索
   * @type {String}
   */
  className: null,
  /**
   * 获取绘制 Shape 的工具类，无状态
   * @param  {String} type 类型
   * @return {Shape} 工具类
   */
  getShape(type?: string): ShapeOptions {
    const self = this as any
    const shape = self[type!] || self[self.defaultShapeType] || self['simple-circle']
    return shape
  },
  /**
   * 绘制图形
   * @param  {String} type  类型
   * @param  {Object} cfg 配置项
   * @param  {G.Group} group 图形的分组
   * @return {IShape} 图形对象
   */
  draw(type: string, cfg: ModelConfig, group: Group, item: IItem): DisplayObject {
    const shape = this.getShape(type)
    const rst = shape.draw!(cfg, group, item)
    if (shape.afterDraw) {
      shape.afterDraw(cfg, group, item, rst)
    }
    return rst
  },
  /**
   * 更新
   * @param  {String} type  类型
   * @param  {Object} cfg 配置项
   * @param  {G6.Item} item 节点、边、分组等
   */
  baseUpdatePosition(type: string, cfg: ModelConfig, group: Group, item: IItem) {
    const shape = this.getShape(type)

    // 防止没定义 update 函数
    if (shape.updatePosition) {
      const rst = shape.updatePosition?.(cfg, group, item)

      if (shape.afterUpdatePosition) {
        shape.afterUpdatePosition(cfg, group, item, rst)
      }
    }
  },
  /**
   * 设置状态
   * @param {String} type  类型
   * @param {String} name  状态名
   * @param {String | Boolean} value 状态值
   * @param {G6.Item} item  节点、边、分组等
   */
  setState(type: string, name: string, value: string | boolean, item: IItem) {
    const shape = this.getShape(type)

    // 调用 shape/shapeBase.ts 中的 setState 方法
    shape.setState!(name, value, item)
  },
  /**
   * 是否允许更新，不重新绘制图形
   * @param  {String} type 类型
   * @return {Boolean} 是否允许使用更新
   */
  shouldUpdatePosition(type: string): boolean {
    const shape = this.getShape(type)
    return !!shape.updatePosition
  },
}

/**
 * 元素的框架
 */
const ShapeFramework = {
  // 默认样式及配置
  options: {},
  /**
   * 绘制
   */
  draw(cfg: ModelConfig, group: Group) {
    return this.drawShape(cfg, group)
  },
  /**
   * 绘制
   */
  drawShape(_cfg: ModelConfig, _group: Group) {},
  /**
   * 设置节点、边状态
   */
  setState(/* name, value, item */) {},
}

export default class Shape {
  public static Node: any

  public static Edge: any

  public static Combo: any

  public static registerFactory(factoryType: string, cfg: object): object {
    const className = ucfirst(factoryType)
    const factoryBase = ShapeFactoryBase
    const shapeFactory = { ...factoryBase, ...cfg } as any
    ;(Shape as any)[className] = shapeFactory
    shapeFactory.className = className
    return shapeFactory
  }

  public static getFactory(factoryType: string) {
    const className = ucfirst(factoryType)
    return (Shape as any)[className]
  }

  public static registerNode(
    shapeType: string,
    nodeDefinition: ShapeOptions,
    extendShapeType?: string
  ) {
    const shapeFactory = Shape.Node

    shapeFactory.getShape(extendShapeType)
    const extendShape = extendShapeType ? shapeFactory.getShape(extendShapeType) : ShapeFramework
    const shapeObj = { ...extendShape, ...nodeDefinition }

    shapeObj.type = shapeType
    shapeObj.itemType = 'node'
    shapeFactory[shapeType] = shapeObj
    return shapeObj
  }

  public static registerEdge(
    shapeType: string,
    edgeDefinition: ShapeOptions,
    extendShapeType?: string
  ) {
    const shapeFactory = Shape.Edge
    const extendShape = extendShapeType ? shapeFactory.getShape(extendShapeType) : ShapeFramework
    const shapeObj = { ...extendShape, ...edgeDefinition }
    shapeObj.type = shapeType
    shapeObj.itemType = 'edge'
    shapeFactory[shapeType] = shapeObj
    return shapeObj
  }
}

// 注册 Node 的工厂方法
Shape.registerFactory('node', {
  defaultShapeType: 'circle',
})

// 注册 Edge 的工厂方法
Shape.registerFactory('edge', {
  defaultShapeType: 'line',
})

export { Shape }
