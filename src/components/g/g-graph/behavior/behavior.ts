import { clone, each } from '@antv/util'
import { GEvent, GEventName, IGraph } from '../interface'
import {
  BaseBehavior,
  EventBehaviorFunc,
  EventBehaviorReturnTypes,
  IBehaviorInner,
} from '../interface/behavior'

const baseBehavior: BaseBehavior<{}, any> = {
  getDefaultCfg() {
    return {}
  },

  getEvents() {
    return {}
  },

  /**
   * auto bind events when register behavior
   * @param graph Graph instance
   */
  bind(graph: IGraph) {
    const { bindEvents } = this
    this.graph = graph
    each(bindEvents, (value, key) => {
      graph.on(key, value)
    })
  },

  unbind(graph: IGraph) {
    const { bindEvents } = this

    each(bindEvents, (value, key) => {
      graph.off(key, value)
    })
  },

  get(val: string) {
    return (this as any).cfg[val]
  },

  set(key: string, val: any) {
    ;(this as any).cfg[key] = val
    return this
  },

  events: {} as any,
}

export class Behavior {
  // 所有自定义的 Behavior 的实例
  private static types = {}

  public static registerBehaviorInner<
    Eventors extends EventBehaviorFunc,
    Config extends Record<string, any>,
    Methods extends Record<string, (...args: any[]) => any>
  >(
    type: string,
    options: {
      getEvents: () => Record<GEventName, string>
      getDefaultCfg?: () => Config
      events: ThisType<IBehaviorInner<Config> & EventBehaviorReturnTypes<Eventors> & Methods>
      methods: Methods &
        ThisType<IBehaviorInner<Config> & EventBehaviorReturnTypes<Eventors> & Methods>
    }
  ) {
    const prototype = clone(baseBehavior)
    Object.assign(prototype, options)

    const base = function (
      this: BaseBehavior<Eventors, Config> &
        IBehaviorInner<Config> &
        EventBehaviorReturnTypes<Eventors>,
      cfg: any
    ) {
      this.cfg = Object.assign({}, this.getDefaultCfg == null ? {} : this.getDefaultCfg(), cfg)
      Object.assign(this, options.methods)

      const events = this.getEvents()

      const bindEvents = {}

      if (events) {
        each(events, (value, key) => {
          bindEvents[key] = (e: GEvent) => {
            options.events[value].apply(this, [e])
          }
        })
        this.bindEvents = bindEvents
      }
    }

    base.prototype = prototype
    Behavior.types[type] = base
  }

  public static hasBehavior(type: string) {
    return !!Behavior.types[type]
  }

  public static getBehavior(type: string) {
    return Behavior.types[type]
  }
}
