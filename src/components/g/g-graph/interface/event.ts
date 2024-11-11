import {
  FederatedMouseEvent,
  FederatedPointerEvent,
  FederatedWheelEvent,
} from '../../g-lite'
import { IItem } from './item'

export interface GEventCommon {
  item: IItem | null
}

export interface GMouseEvent extends GEventCommon, FederatedMouseEvent {}
export interface GPointerEvent extends GEventCommon, FederatedPointerEvent {}
export interface GWheelEvent extends GEventCommon, FederatedWheelEvent {}

export type GEvent = GMouseEvent | GPointerEvent | GWheelEvent

export type GEventNameKey = 'canvas' | 'node' | 'edge'
export type GEventNameValue = 'click' | 'mouseenter' | 'mouseleave'

export type GEventNameCommon = `${GEventNameKey}:${GEventNameValue}`

export type GEventName = GEventNameCommon | string
