import { isString } from '@antv/util'
import { IGraph } from '../interface/graph'
import { IItem } from '../interface/item'

export class StateController {
  private graph: IGraph

  public destroyed: boolean

  constructor(graph: IGraph) {
    this.graph = graph
    this.destroyed = false
  }

  /**
   * 更新 Item 的状态
   *
   * @param {IItem} item Item实例
   * @param {string} state 状态名称
   * @param {boolean} enabled 状态是否可用
   * @memberof State
   */
  public updateState(item: IItem, state: string, enabled: string | boolean) {
    const graphStates = this.graph.get('states')
    let key = state
    if (isString(enabled)) key = `${state}:${enabled}`
    if (!graphStates[key]) graphStates[key] = []
    if (enabled) graphStates[key].push(item)
    else graphStates[key] = graphStates[key].filter((itemInState: any) => itemInState !== item)
    this.graph.set('states', graphStates)
    this.graph.emit('graphstatechange', { states: graphStates })
  }

  /**
   * 批量更新 states，兼容 updateState，支持更新一个 state
   *
   * @param {IItem} item
   * @param {(string | string[])} states
   * @param {boolean} enabled
   * @memberof State
   */
  public updateStates(item: IItem, states: string | string[], enabled: string | boolean) {
    const graphStates = this.graph.get('states')
    const stateNames = isString(states) ? [states] : states
    stateNames.forEach((stateName) => {
      let key = stateName
      if (!graphStates[key]) graphStates[key] = []
      if (isString(enabled)) key = `${stateName}:${enabled}`
      if (enabled) graphStates[key].push(item)
      else graphStates[key] = graphStates[key].filter((itemInState: any) => itemInState !== item)
    })
    this.graph.set('states', graphStates)
    this.graph.emit('graphstatechange', { states })
  }

  public destroy() {
    ;(this.graph as IGraph | null) = null
    this.destroyed = true
  }
}
