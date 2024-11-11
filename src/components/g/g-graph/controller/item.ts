import { clone, deepMix, isArray, isObject, isString, throttle, upperFirst } from '@antv/util'
import { Group } from '../../g-lite'
import { IGraph, ITEM_TYPE } from '../interface/graph'
import { IEdge, INode, IItem } from '../interface/item'
import { EdgeConfig, ModelConfig, NodeConfig, UpdateType } from '../interface/shape'
import { each } from '@antv/util'
import { Edge } from '../item/edge'
import { Node } from '../item/node'
import { globalConstants } from '../interface/constant'

const CFG_PREFIX = 'default'
const NODE = 'node'
const EDGE = 'edge'

type Id = string | IItem | undefined

export class ItemController {
  // @ts-ignore
  private graph: IGraph

  public destroyed: boolean

  private edgeToBeUpdateMap: {
    [key: string]: {
      edge: IEdge
      updateType: UpdateType
    }
  } = {}

  constructor(graph: IGraph) {
    this.graph = graph
    this.destroyed = false
  }

  /**
   * 增加 Item 实例
   *
   * @param {ITEM_TYPE} type 实例类型，node 或 edge
   * @param {(NodeConfig & EdgeConfig)} model 数据模型
   * @returns {(IItem)}
   * @memberof ItemController
   */
  public addItem<T extends IItem>(type: ITEM_TYPE, model: ModelConfig): IItem | boolean {
    const { graph } = this

    const parent: Group = graph.get('group')
    const upperType = upperFirst(type)

    let item: IItem | null = null

    const defaultModel = graph.get((CFG_PREFIX + upperType) as 'defaultNode' | 'defaultEdge')

    if (defaultModel) {
      // 很多布局会直接修改原数据模型，所以不能用 merge 的形式，逐个写入原 model 中
      each(defaultModel, (val, cfg) => {
        if (isObject(val) && !isArray(val)) {
          model[cfg] = deepMix({}, val, model[cfg])
        } else if (isArray(val)) {
          model[cfg] = model[cfg] || clone(defaultModel[cfg])
        } else {
          model[cfg] = model[cfg] || defaultModel[cfg]
        }
      })
    }

    if (type === EDGE) {
      let source: Id
      let target: Id
      source = (model as EdgeConfig).source // eslint-disable-line prefer-destructuring
      target = (model as EdgeConfig).target // eslint-disable-line prefer-destructuring

      if (source && isString(source)) {
        source = graph.findById(source)
      }
      if (target && isString(target)) {
        target = graph.findById(target)
      }

      if (!source || !target) {
        console.warn(`The source or target node of edge ${model.id} does not exist!`)
        return false
      }

      const group = new Group({
        name: globalConstants.nodeGroupName,
        style: {
          zIndex: 0 // 边的层级
        }
      })
      parent.appendChild(group)
      item = new Edge({
        model,
        source,
        target,
        group,
      })
    } else if (type === NODE) {
      const group = new Group({
        name: globalConstants.edgeGroupName,
        style: {
          zIndex: 1 // 节点的层级
        }
      })
      parent.appendChild(group)
      item = new Node({
        model,
        group,
      })
    }

    if (item) {
      graph.get(`${type}s`).push(item as any)
      graph.get('itemMap')[item.get('id')] = item
      return item as T
    }
    return false
  }

  /**
   * 更新节点或边
   *
   * @param {IItem} item ID 或 实例
   * @param {(EdgeConfig | Partial<NodeConfig>)} cfg 数据模型
   * @returns
   * @memberof ItemController
   */
  public updateItem(
    item: IItem | string,
    cfg: EdgeConfig | Partial<NodeConfig>,
    updateType?: UpdateType
  ) {
    const { graph } = this

    if (isString(item)) {
      item = graph.findById(item) as IItem
    }

    if (!item || item.destroyed) {
      return
    }
    const type = item.getType()
    if (type === EDGE) {
      // 边只能重绘
      item.update(cfg, 'style')
    } else if (type === NODE) {
      item.update(cfg, updateType)

      const edges: IEdge[] = (item as INode).getEdges()

      each(edges, (edge: IEdge) => {
        this.edgeToBeUpdateMap[edge.getID()] = {
          edge: edge,
          updateType,
        }
        this.throttleRefresh()
      })
    }
  }

  /**
   * 更新 item 状态
   *
   * @param {IItem} item Item 实例
   * @param {string} state 状态名称
   * @param {boolean} value 是否启用状态或状态值
   * @returns {void}
   * @memberof ItemController
   */
  public setItemState(item: IItem, state: string, value: string | boolean): void {
    const { graph } = this

    let stateName = state
    if (isString(value)) {
      stateName = `${state}:${value}`
    }

    // 已经存在要设置的 state，或不存在 state 的样式为 undefined
    if (
      (item.hasState(stateName) === value && value) || // 当该状态已经存在且现在需要设置为 true 时，不需要继续。当该状态不存在，且设置为 false 时，需要继续
      (isString(value) && item.hasState(stateName))
    ) {
      // 当该状态 value 是字符串，且已经存在该状态，不需要继续
      return
    }

    graph.emit('beforeitemstatechange', { item, state: stateName, enabled: value })

    item.setState(state, value)

    graph.autoPaint()
    graph.emit('afteritemstatechange', { item, state: stateName, enabled: value })
  }

  /**
   * 清除所有指定的状态
   *
   * @param {IItem} item Item 实例
   * @param {string[]} states 状态名称集合
   * @memberof ItemController
   */
  public clearItemStates(item: IItem | string, states?: string | string[]): void {
    const { graph } = this

    if (isString(item)) {
      item = graph.findById(item)
    }

    graph.emit('beforeitemstatesclear', { item, states })

    item.clearStates(states)

    graph.emit('afteritemstatesclear', { item, states })
  }

  /**
   * 更新边限流，同时可以防止相同的边频繁重复更新
   * */
  private throttleRefresh = throttle(
    (_: any) => {
      const { graph } = this
      if (!graph || graph.get('destroyed')) return
      const edgeToBeUpdateMap = this.edgeToBeUpdateMap
      if (!edgeToBeUpdateMap) return
      const edgeValues = Object.values(edgeToBeUpdateMap)
      if (!edgeValues.length) return
      edgeValues.forEach((obj) => {
        const edge = obj.edge
        if (!edge || edge.destroyed) return
        const source = edge.getSource()
        const target = edge.getTarget()
        if (!source || source.destroyed || !target || target.destroyed) return
        edge.update({}, obj.updateType)
      })
      this.edgeToBeUpdateMap = {}
    },
    16,
    {
      trailing: true,
      leading: true,
    }
  )
}
