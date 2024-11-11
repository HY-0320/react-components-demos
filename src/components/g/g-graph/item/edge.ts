import { each, isArray, isObject } from '@antv/util'
import { IEdge, INode } from '../interface/item'
import { EdgeConfig, ModelConfig, NodeConfig, UpdateType } from '../interface/shape'
import { IPoint, SourceTarget } from '../interface/type'
import { Item } from './item'

const ITEM_NAME_SUFFIX = 'Node' // 端点的后缀，如 sourceNode, targetNode

export class Edge extends Item implements IEdge {
  protected getDefaultCfg() {
    return {
      type: 'edge',
      sourceNode: null,
      targetNode: null,
      startPoint: null,
      endPoint: null,
    }
  }

  protected init() {
    super.init()
    // 初始化两个端点
    this.setSource(this.get('source'))
    this.setTarget(this.get('target'))
  }

  public setSource(source: INode) {
    this.setEnd('source', source)
    this.set('source', source)
  }

  public setTarget(target: INode) {
    this.setEnd('target', target)
    this.set('target', target)
  }

  public update(cfg: ModelConfig, _updateType?: UpdateType) {
    const model: ModelConfig = this.get('model')

    // merge update传进来的对象参数，model中没有的数据不做处理，对象和字符串值也不做处理，直接替换原来的
    each(cfg, (val, key) => {
      if (model[key]) {
        if (isObject(val) && !isArray(val)) {
          cfg[key] = { ...(model[key] as Object), ...(cfg[key] as Object) }
        }
      }
    })

    this.draw()
  }

  public getShapeCfg(model: EdgeConfig): EdgeConfig {
    const self = this

    const cfg = super.getShapeCfg(model) as EdgeConfig

    cfg.startPoint = self.getLinkPoint('source', model)
    cfg.endPoint = self.getLinkPoint('target', model)

    return cfg
  }

  private setEnd(name: SourceTarget, value: INode) {
    const itemName = name + ITEM_NAME_SUFFIX
    this.set(itemName, value)

    value.addEdge(this)
  }

  /**
   * 获取连接点的坐标
   * @param name source | target
   * @param model 边的数据模型
   * @param controlPoints 控制点
   */
  private getLinkPoint(name: SourceTarget, _model: EdgeConfig): IPoint {
    const itemName = name + ITEM_NAME_SUFFIX
    const item = this.get(itemName)

    const prePoint = this.getPrePoint(name)
    const point = item.getLinkPoint(prePoint)
    return point
  }

  /**
   * 获取端点的位置
   * @param name
   */
  private getEndPoint(name: SourceTarget): NodeConfig | IPoint {
    const itemName = name + ITEM_NAME_SUFFIX
    const item = this.get(itemName)
    return {
      x: item.get('model').x,
      y: item.get('model').y,
    }
  }

  /**
   * 获取同端点进行连接的点，计算交汇点
   * @param name
   */
  private getPrePoint(name: SourceTarget): NodeConfig | IPoint {
    const oppositeName = name === 'source' ? 'target' : 'source' // 取另一个节点的位置
    return this.getEndPoint(oppositeName)
  }

  public getSource(): INode {
    return this.get('source')
  }

  public getTarget(): INode {
    return this.get('target')
  }
}
