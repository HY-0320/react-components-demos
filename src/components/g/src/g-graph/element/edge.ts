import { isPlainObject } from '@antv/util'
import { DisplayObject, Group, Line, Path } from '../../g-lite'
import { GLOBAL } from '../global'
import { ModelConfig, ShapeOptions } from '../interface/shape'

export const lineEdge: ShapeOptions = {
  itemType: 'edge',
  // 单个图形的类型
  shapeType: 'line',
  options: {
    style: {
      ...GLOBAL.defaultEdge.style,
    },
  },
  draw(cfg: ModelConfig, group: Group): DisplayObject {
    const startPoint = cfg.startPoint
    const endPoint = cfg.endPoint
    let markerEnd
    let markerEndOffset = GLOBAL.defaultArrow.markerEndOffset
    if (cfg.endArrow) {
      if (isPlainObject(cfg.endArrow)) {
        markerEnd = new Path({
          style: {
            ...GLOBAL.defaultArrow.style,
            ...cfg.endArrow,
          },
        })
        markerEndOffset = cfg.endArrow.endOffset ?? markerEndOffset
      } else {
        markerEnd = new Path({
          style: {
            ...GLOBAL.defaultArrow.style,
          },
        })
      }
    }

    const line = new Line({
      id: cfg.id,
      name: 'line',
      style: {
        x1: startPoint!.x,
        y1: startPoint!.y,
        x2: endPoint!.x,
        y2: endPoint!.y,
        ...(cfg.style as any),
        markerEnd,
        markerEndOffset,
      },
    })

    group.appendChild(line)

    return line
  },
}
