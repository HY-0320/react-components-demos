import { BaseStyleProps } from '../types'
import { LineStyleProps } from './Line'
import { PathStyleProps } from './Path'
import { PolygonStyleProps } from './Polygon'
import { PolylineStyleProps } from './Polyline'

export interface AllShapeStyle
  extends BaseStyleProps,
    LineStyleProps,
    PathStyleProps,
    PolygonStyleProps,
    PolylineStyleProps {
  cx?: number | string | null
  cy?: number | string | null
  r: number | string | null
  rx: number | string | null
  ry: number | string | null
  x?: number | string
  y?: number | string
  width?: number | string
  height?: number | string
  innerHTML: string | HTMLElement
  z?: number
  img?: string | HTMLImageElement
  src?: string | HTMLImageElement
  isBillboard?: boolean
  /**
   * top-left, top-right, bottom-right, bottom-left
   */
  radius?: number | string | number[]
}
