import { IGraph } from '.'
import { GEventName } from './event'

export interface IBehaviorInner<Config extends Record<string, any>> {
  type: string
  graph: IGraph
  cfg: Config
  get: (key: string) => any
  set: (key: string, value: any) => void
  bindEvents: Record<string, any>
}

export interface EventBehavior {
  [key: string]: (...args: any) => any
}

export type BehaviorOption<
  Eventors extends EventBehaviorFunc,
  Config extends Record<string, any>
> = EventBehavior & {
  getDefaultCfg?: () => Config
  getEvents: () => Record<GEventName, string>
  events: ThisType<IBehaviorInner<Config> & EventBehaviorReturnTypes<Eventors>>
}

export type BaseBehavior<
  Eventors extends EventBehaviorFunc,
  Config extends Record<string, any>
> = BehaviorOption<Eventors, any> & {
  bind: (this: IBehaviorInner<Config> & EventBehaviorReturnTypes<Eventors>, g: IGraph) => void
  unbind: (this: IBehaviorInner<Config> & EventBehaviorReturnTypes<Eventors>, g: IGraph) => void
}

export type EventBehaviorFunc = Record<string, () => any>

export type EventBehaviorReturnTypes<T extends EventBehaviorFunc> = {
  [K in keyof T]: ReturnType<T[K]>
}

export interface BehaviorConfig {
  cfg?: Record<string, any>
  type: string
}

export type IBehavior<Config extends Record<string, any>> = IBehaviorInner<Config> &
  BaseBehavior<any, Config>
