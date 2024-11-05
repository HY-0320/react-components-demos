import { Behavior } from '../behavior/behavior'
import { BehaviorConfig, IBehavior } from '../interface/behavior'
import { IGraph } from '../interface/graph'

export class BehaviorController {
  // @ts-ignore
  private graph: IGraph

  public destroyed: boolean

  private behaviors: IBehavior<any>[] = []

  constructor(graph: IGraph) {
    this.graph = graph
    this.destroyed = false

    const behaviorConfigs = graph.get('behaviors')

    this.setBehaviors(behaviorConfigs)
  }

  public destory() {
    this.unbindAll()
    this.destroyed = true
  }

  public setBehaviors(behaviorConfigs: BehaviorConfig[]) {
    this.unbindAll()

    if (behaviorConfigs && behaviorConfigs.length > 0) {
      behaviorConfigs.forEach((be) => {
        const BehaviorInstance = Behavior.getBehavior(be.type)
        if (!BehaviorInstance) {
          return
        }
        const behavior: any = new BehaviorInstance(be.cfg)
        if (behavior) {
          behavior.bind(this.graph)
          this.behaviors.push(behavior)
        }
      })
    }
  }

  private unbindAll() {
    if (this.behaviors.length > 0) {
      this.behaviors.forEach((behavior) => {
        behavior.unbind(this.graph)
      })
      this.behaviors = []
    }
  }
}
