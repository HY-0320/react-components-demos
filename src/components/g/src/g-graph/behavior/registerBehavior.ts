import { GEventName } from '../interface'
import { EventBehaviorFunc, EventBehaviorReturnTypes, IBehaviorInner } from '../interface/behavior'
import { Behavior } from './behavior'
import { registerDragNode } from './drag-node'

let hasRegisterInner = false

export function registerAllInnerBehavior() {
  if (!hasRegisterInner) {
    registerDragNode()

    hasRegisterInner = true
  }
}

export function registerBehavior<
  Eventors extends EventBehaviorFunc,
  Config extends Record<string, any>,
  Methods extends Record<string, (...args: any[]) => any>
>(
  type: string,
  options: {
    getEvents: () => Record<GEventName, string>
    getDefaultCfg?: () => Config
    events: ThisType<IBehaviorInner<Config> & EventBehaviorReturnTypes<Eventors>>
    methods: Methods &
      ThisType<IBehaviorInner<Config> & EventBehaviorReturnTypes<Eventors> & Methods>
  }
) {
  registerAllInnerBehavior()

  Behavior.registerBehaviorInner(type, options)
}
