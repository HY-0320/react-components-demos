import {
  deepMix,
  each,
  isArray,
  isBoolean,
  isObject,
  isPlainObject,
  isString,
  uniqueId,
} from '@antv/util'
import { IItemBase, IItemBaseConfig } from '../interface/item'
import { IShapeFactory, ModelConfig, UpdateType } from '../interface/shape'
import Shape from '../element/shape'
import { Group } from '../../g-lite'
import { ITEM_TYPE } from '../interface/graph'

export class Item implements IItemBase {
  public _cfg: IItemBaseConfig & {
    [key: string]: unknown
  } = {}

  public destroyed: boolean = false

  constructor(cfg: IItemBaseConfig) {
    const defaultCfg: IItemBaseConfig = {
      /**
       * id
       * @type {string}
       */
      id: undefined,

      /**
       * 类型
       * @type {string}
       */
      type: 'item',

      /**
       * data model
       * @type {object}
       */
      model: {} as ModelConfig,

      /**
       * g group
       * @type {G.Group}
       */
      group: undefined,

      /**
       * is open animate
       * @type {boolean}
       */
      animate: false,

      /**
       * visible - not group visible
       * @type {boolean}
       */
      visible: true,

      /**
       * locked - lock node
       * @type {boolean}
       */
      locked: false,
      /**
       * capture event
       * @type {boolean}
       */
      event: true,
      /**
       * key shape to calculate item's bbox
       * @type object
       */
      keyShape: undefined,
      /**
       * item's states, such as selected or active
       * @type Array
       */
      states: [],
    }
    this._cfg = Object.assign(defaultCfg, this.getDefaultCfg(), cfg)

    const model = this.get('model')
    const itemType = this.get('type')

    let { id } = model
    if (typeof id === 'undefined') {
      id = uniqueId(itemType)
    } else if (typeof id !== 'string') {
      id = String(id)
    }

    const group: Group = this.get('group')
    group.id = id

    this.get('model').id = id
    this.set('id', id)

    this.init()

    const shapeType =
      (model.shape as string) || (model.type as string) || (itemType === 'edge' ? 'line' : 'circle')
    const shapeFactory = this.get('shapeFactory')
    if (shapeFactory && shapeFactory[shapeType]) {
      const { options } = shapeFactory[shapeType]
      if (options && options.style) {
        model.style = deepMix({}, options.style, model.style)
      }
    }

    this.set('originalStyle', model.style)
    this.draw()
  }

  protected init() {
    const shapeFactory = Shape.getFactory(this.get('type'))
    this.set('shapeFactory', shapeFactory)
  }

  /**
   * draw shape
   */
  public draw() {
    this.drawInner()

    const states: string[] = this.get('states')
    const shapeFactory = this.get('shapeFactory')

    if (shapeFactory) {
      const model: ModelConfig = this.get('model')
      const type = model.type

      states.forEach((s) => {
        if (s.includes(':')) {
          const r = s.split(':')
          shapeFactory.setState(type, r[0], r[1], this)
        } else {
          shapeFactory.setState(type, s, true, this)
        }
      })
    }
  }

  public getShapeCfg(model: ModelConfig): ModelConfig {
    return model
  }

  /**
   * draw shape
   */
  private drawInner() {
    const self = this
    const shapeFactory = self.get('shapeFactory')
    const group: Group = self.get('group')
    const model: ModelConfig = self.get('model')

    group.removeChildren()

    if (!shapeFactory) {
      return
    }
    const cfg = self.getShapeCfg(model) // 可能会附加额外信息
    const shapeType = cfg.type as string

    const keyShape = shapeFactory.draw(shapeType, cfg, group, this)

    if (keyShape) {
      self.set('keyShape', keyShape)
      keyShape.set('isKeyShape', true)
      keyShape.set('draggable', true)
    }
  }

  /**
   * 设置属性
   * @internal 仅内部类使用
   * @param {String|Object} key 属性名，也可以是对象
   * @param {object | string | number} val 属性值
   */
  public set(key: string | object, val?: unknown): void {
    if (isPlainObject(key)) {
      this._cfg = { ...this._cfg, ...key }
    } else {
      this._cfg[key] = val
    }
  }
  /**
   * 获取属性
   * @internal 仅内部类使用
   * @param  {String} key 属性名
   * @return {object | string | number} 属性值
   */
  public get<T = any>(key: string): T {
    return this._cfg[key] as T
  }

  /**
   * 获取当前元素的所有状态
   * @return {Array} 元素的所有状态
   */
  public getStates(): string[] {
    return this.get('states')
  }

  /**
   * 当前元素是否处于某状态
   * @param {String} state 状态名
   * @return {Boolean} 是否处于某状态
   */
  public hasState(state: string): boolean {
    const states = this.getStates()
    return states.indexOf(state) >= 0
  }

  /**
   * 更改元素状态， visible 不属于这个范畴
   * @internal 仅提供内部类 graph 使用
   * @param {String} state 状态名
   * @param {Boolean} value 节点状态值
   */
  public setState(state: string, value: string | boolean) {
    const states: string[] = this.get('states')
    const shapeFactory = this.get('shapeFactory')
    let stateName = state
    let filterStateName = state
    if (isString(value)) {
      stateName = `${state}:${value}`
      filterStateName = `${state}:`
    }

    let newStates = states

    if (isBoolean(value)) {
      const index = states.indexOf(filterStateName)
      if (value) {
        if (index > -1) {
          return
        }
        states.push(stateName)
      } else if (index > -1) {
        states.splice(index, 1)
      }
    } else if (isString(value)) {
      // 过滤掉 states 中 filterStateName 相关的状态
      const filterStates = states.filter((name) => name.includes(filterStateName))

      if (filterStates.length > 0) {
        this.clearStates(filterStates)
      }
      newStates = newStates.filter((name) => !name.includes(filterStateName))

      newStates.push(stateName)
      this.set('states', newStates)
    }

    if (shapeFactory) {
      const model: ModelConfig = this.get('model')
      const type = model.type

      // 调用 shape/shape.ts 中的 setState
      shapeFactory.setState(type, state, value, this)
    }
  }

  /**
   * 清除指定的状态，如果参数为空，则不做任务处理
   * @param states 状态名称
   */
  public clearStates(states?: string | string[]) {
    const self = this
    const originStates = self.getStates()
    const shapeFactory = self.get('shapeFactory')
    const model: ModelConfig = self.get('model')
    const shape = model.type
    if (!states) {
      states = originStates
    }

    if (isString(states)) {
      states = [states]
    }

    const newStates = originStates.filter((state) => states!.indexOf(state) === -1)
    self.set('states', newStates)

    states.forEach((state) => {
      shapeFactory.setState(shape, state, false, self)
    })
  }

  public update(cfg: ModelConfig, updateType?: UpdateType) {
    const model: ModelConfig = this.get('model')
    const type = model.type

    if (updateType === 'move') {
      if (cfg.x != null && cfg.y != null) {
        model.x = cfg.x
        model.y = cfg.y
      }
      if (cfg.size != null) {
        model.size = cfg.size
      }
      const shapeFactory: IShapeFactory = this.get('shapeFactory')
      if (shapeFactory.shouldUpdatePosition(type!)) {
        shapeFactory.baseUpdatePosition(type!, model, this.get('group'), this as any)
        return
      }
    }
    // re draw
    if (updateType !== 'move') {
      // merge update传进来的对象参数，model中没有的数据不做处理，对象和字符串值也不做处理，直接替换原来的
      each(cfg, (val, key) => {
        if (model[key]) {
          if (isObject(val) && !isArray(val)) {
            cfg[key] = { ...(model[key] as Object), ...(cfg[key] as Object) }
          }
        }
      })
    }
    this.draw()
  }

  /**
   * 节点类型
   * @return {string} 节点的类型
   */
  public getType(): ITEM_TYPE {
    return this.get('type')
  }

  /**
   * 获取 Item 的ID
   */
  public getID(): string {
    return this.get('id')
  }

  protected getDefaultCfg() {
    return {}
  }

  show: () => void
  hide: () => void
}
