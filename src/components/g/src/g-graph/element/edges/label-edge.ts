import { IAnimation, Line, DisplayObject, Group, Path, Text, Rect } from '../../../g-lite'
import { ModelConfig, ShapeOptions } from '../../interface/shape'
import { isPlainObject } from '@antv/util'
import { GLOBAL } from '../../global'

export const labelEdgeLine: ShapeOptions = {
  itemType: 'edge',
  // 单个图形的类型
  shapeType: 'line',
  options: {},
  draw(cfg: ModelConfig, group: Group): DisplayObject {
    const { edgeInfo } = cfg as any
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
            stroke: '#1890FF',
          },
        })
        markerEndOffset = cfg.endArrow.endOffset ?? markerEndOffset
      } else {
        markerEnd = new Path({
          style: {
            ...GLOBAL.defaultArrow.style,
            stroke: '#1890FF',
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
        stroke: '#1890FF',
        lineWidth:1,
        opacity:0.8,
        lineDash: [4, 2, 1, 2],
        ...(cfg.style as any),
        markerEnd,
        markerEndOffset,
      },
    })

    group.appendChild(line)

    if (edgeInfo?.metrics && edgeInfo?.metrics?.length > 0) {
      // 计算终点位置
      const cx = (startPoint!.x + endPoint!.x) / 2
      const cy = (startPoint!.y + endPoint!.y) / 2
      let text = edgeInfo.metrics.map((metric: any) => `${metric.metricName}: ${metric.formatValue}`)
      const label = new Text({
        style: {
          x: cx,
          y: cy,
          text: text.join('\n'), // 文本内容
          fontFamily: 'Avenir', // 字体
          lineHeight: 18,
          fontSize: 14, // 字号
          fill: '#fff', // 文本颜色
          textAlign: 'center', // 水平居中
          textBaseline: 'middle', // 垂直居中
          cursor: 'pointer',
          visibility: 'hidden',
        },
      })

      const bbox = label.getBBox()
      const padding = 4
      const rect = new Rect({
        style: {
          x: bbox.x - padding,
          y: bbox.y - padding - 2, // 有两像素的偏移
          radius: 5,
          width: bbox.width + padding * 2,
          height: bbox.height + padding * 2,
          fill: '#25282E',
          fillOpacity: 0.8,
          visibility: 'hidden',
        },
      })
      group.appendChild(rect)
      group.appendChild(label)
    }

    return line
  },
  setState(name, value, item) {
    const line: Line = item.get('keyShape')
    const group: Group = item.get('group')

    // 置灰非相关边
    if (name === 'greyNoRelatedEdges') {
      if (value) {
        line.setAttribute('opacity', 0.3)
      } else {
        line.setAttribute('opacity', 1)
      }
    }

    // 展示指标
    if (name === 'showMetric') {
      const children = group.children
      if (value) {
        children.forEach((child, index) => {
          if (index !== 0) {
            child.setAttribute('visibility', 'visible')
          }
        })
      } else {
        children.forEach((child, index) => {
          if (index !== 0) {
            child.setAttribute('visibility', 'hidden')
          }
        })
      }
    }

    let dashAnimate: IAnimation | null = item.get('dashAnimate')
    // 开启 running动画
    if (name === 'running') {
      if (value) {
        if (dashAnimate != null) {
          dashAnimate.cancel()
        }

        dashAnimate = line.animate([{ lineDashOffset: 0 }, { lineDashOffset: -10 }], {
          duration: 500,
          iterations: Infinity,
        })
        item.set('dashAnimate', dashAnimate)
        dashAnimate?.play()
      } else {
        if (dashAnimate) {
          dashAnimate.cancel()
          item.set('dashAnimate', null)
        }
      }
    }
    // hover 相关联节点
    // 开启动画 展示指标 提高当前边的层级2
    if (name === 'hoverRelateNode') {
      const children = group.children
      if (value) {
        if (dashAnimate != null) {
          dashAnimate.cancel()
        }

        dashAnimate = line.animate([{ lineDashOffset: 0 }, { lineDashOffset: -10 }], {
          duration: 500,
          iterations: Infinity,
        })

        children.forEach((child, index) => {
          if (index !== 0) {
            child.setAttribute('visibility', 'visible')
          }
        })
        group.setAttribute('zIndex', 2)
        item.set('dashAnimate', dashAnimate)
        dashAnimate?.play()
      } else {
        group.setAttribute('zIndex', 0)
        children.forEach((child, index) => {
          if (index !== 0) {
            child.setAttribute('visibility', 'hidden')
          }
        })
        if (dashAnimate) {
          dashAnimate.cancel()
          item.set('dashAnimate', null)
        }
      }
    }
  },
}
