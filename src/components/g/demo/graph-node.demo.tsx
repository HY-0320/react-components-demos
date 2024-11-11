import React, { useEffect } from 'react'
import { Canvas, Circle, Text, Image } from '../g-lite'
import { Renderer } from '../g-canvas'
import { Plugin as DragDrogPlugin } from '../g-plugin-dragndrop'
import Android from './android.svg'

// function sleep(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms))
// }

function getPercent(value: number, min: number, max: number) {
  if (value < min || value > max || min >= max) {
    return 100
  }
  return (value - min) / (max - min)
}

function getNodeByType(type: 'text_node' | 'icon_node' | 'metric_node', cfg: any) {
  const defaultSize = 50
  const defaultLineWidth = 2
  const defaultLabelPadding = 10

  // 初始化 默认circle 容器
  const containerNode = new Circle({
    style: {
      cx: cfg.x,
      cy: cfg.y,
      r: defaultSize, // 默认大小
      stroke: '#0070cc', // 默认颜色
      fill: '#fff',
      lineWidth: defaultLineWidth,
      cursor: 'pointer',
      draggable: true,
      filter: cfg?.filter ?? "none",
    },
  })

  // node label
  const nodeLabel = new Text({
    style: {
      text: cfg.label, // 文本内容
      fontFamily: 'Avenir', // 字体
      fontSize: 12, // 字号
      fill: '#000', // 文本颜色
      textAlign: 'center', // 水平居中
      textBaseline: 'middle', // 垂直居中
      cursor: 'pointer',
      filter: cfg?.filter ?? "none",
    },
  })

  // 文本类型节点
  if (type === 'text_node') {
    // containerNode.appendChild(circle)
    containerNode.appendChild(nodeLabel)
    return containerNode
  }

  // icon类型节点
  if (type === 'icon_node') {
    const dist = defaultSize * Math.cos(Math.PI * (1 / 4))
    const icon = new Image({
      style: {
        width: dist * 2,
        height: dist * 2,
        img: cfg.img,
        cursor: 'pointer',
        transformOrigin: 'center',
        transform: `translate(${-dist},${-dist})`,
        filter: cfg?.filter ?? "none",
      },
    })
    nodeLabel.setAttribute(
      'transform',
      `translateY(${defaultSize + defaultLineWidth + defaultLabelPadding})`
    ) // 相对于中心偏移量 r + circle linwidth + padding
    // containerNode.appendChild(circle)
    containerNode.appendChild(icon)
    containerNode.appendChild(nodeLabel)
    return containerNode
  }

  // metric 类型节点
  // 涉及计算
  if (type === 'metric_node') {
    // 相对于中心偏移量 r + circle linwidth + padding
    const { metrics } = cfg ?? {}
    let radius = defaultSize
    const metricsLength = metrics.length
    metrics.forEach((metric: any, index: number) => {
      const min = metric?.min ?? 0 // 最小值
      const max = metric?.max ?? 100 // 最大值
      const percent = getPercent(metric.value, min, max) // 计算比例
      const perimeter = 2 * Math.PI * radius // 周长
      const [valueLength, emtyLength] = [perimeter * percent, perimeter - perimeter * percent] // 计算圆环长度
      // 用来显示值
      const outerCircle = new Circle({
        style: {
          r: radius, // 默认大小
          stroke: metric?.stroke ?? '#F04864', // 默认颜色
          fill: 'transparent',
          lineWidth: defaultLineWidth,
          cursor: 'pointer',
          lineDash: [valueLength, emtyLength],
          filter: cfg?.filter ?? "none",
        },
      })
      // 用来填充空白
      const innerCircle = new Circle({
        style: {
          r: radius, // 默认大小
          stroke: metric?.baseColor ?? '#0070cc', // 默认颜色
          fill: 'transparent',
          lineWidth: defaultLineWidth,
          cursor: 'pointer',
          lineDash: [emtyLength, valueLength],
          lineDashOffset: -valueLength,
          filter: cfg?.filter ?? "none",
        },
      })
      // 指标展示
      const showMetricName = cfg?.showMetricName ?? true
      const label = showMetricName ? `${metric?.name}: ${metric?.value}` : `${metric?.value}`

      const text = new Text({
        style: {
          text: label, // 文本内容
          fontFamily: 'Avenir', // 字体
          fontSize: 12, // 字号
          fill: '#000', // 文本颜色
          textAlign: 'center', // 水平居中
          textBaseline: 'middle', // 垂直居中
          filter: cfg?.filter ?? "none",
        },
      })
      // 最多放两个指标
      if (metricsLength === 2) {
        text.setAttribute('transform', index === 0 ? 'translateY(-10)' : 'translateY(10)')
      }
      innerCircle.appendChild(text)
      containerNode.appendChild(outerCircle)
      containerNode.appendChild(innerCircle)
      radius -= 5
    })
    nodeLabel.setAttribute(
      'transform',
      `translateY(${defaultSize + defaultLineWidth + defaultLabelPadding})`
    ) // 相对于中心偏移量 r + circle linwidth + padding
    containerNode.appendChild(nodeLabel)
  }

  return containerNode
}

/**
 * ---
 * order: 5
 * title: graph 节点样式
 * ---
 * 测试.
 */
export default () => {
  useEffect(() => {
    const init = async () => {
      const canvasRenderer = new Renderer()
      canvasRenderer.registerPlugin(
        new DragDrogPlugin({
          isDocumentDroppable: true,
          isDocumentDraggable: true,
        })
      )

      const canvas = new Canvas({
        container: 'canvasdemo4',
        width: 600,
        height: 500,
        renderer: canvasRenderer as any,
      })

      await canvas.ready

      const baseNode = getNodeByType('text_node', { x: 100, y: 100, label: 'Text node' })
      const iconNode = getNodeByType('icon_node', {
        x: 300,
        y: 100,
        label: 'Icon node',
        img: Android,
      })
      const metric1Node = getNodeByType('metric_node', {
        x: 100,
        y: 300,
        label: 'Metric node',
        metrics: [
          {
            name: 'metric1',
            value: 20,
            min: 0,
            max: 100,
            stroke: '#F04864',
            baseColor: '#F04864',
          },
        ],
      })
      const metric2Node = getNodeByType('metric_node', {
        x: 300,
        y: 300,
        label: 'Metric node',
        filter: 'brightness(0.8) opacity(0.3)',
        metrics: [
          {
            name: 'metric1',
            value: 20,
            min: 0,
            max: 100,
            stroke: '#3CB371',
            baseColor: '#F04864',
          },
          {
            name: 'metric2',
            value: 0.5,
            min: 0,
            max: 1,
            stroke: '#3CB371',
            baseColor: '#F04864',
          },
        ],
      })
      const metric3Node = getNodeByType('metric_node', {
        x: 500,
        y: 100,
        label: 'Metric node',
        showMetricName: false,
        metrics: [
          {
            name: 'metric1',
            value: 20,
            min: 0,
            max: 100,
            stroke: '#F04864',
            baseColor: '#F04864',
          },
        ],
      })
      const metric4Node = getNodeByType('metric_node', {
        x: 500,
        y: 300,
        label: 'Metric node',
        showMetricName: false,
        metrics: [
          {
            name: 'metric1',
            value: 20,
            min: 0,
            max: 100,
            stroke: '#3CB371',
            baseColor: '#F04864',
          },
          {
            name: 'metric2',
            value: 0.5,
            min: 0,
            max: 1,
            stroke: '#3CB371',
            baseColor: '#F04864',
          },
        ],
      })

      canvas.appendChild(baseNode)
      canvas.appendChild(iconNode)
      canvas.appendChild(metric1Node)
      canvas.appendChild(metric2Node)
      canvas.appendChild(metric3Node)
      canvas.appendChild(metric4Node)

      // 拖拽
      function updataNodePosition() {
        let shiftX = 0
        let shiftY = 0
        const moveAt = (target: any, canvasX: any, canvasY: any) => {
          target.setPosition(canvasX - shiftX, canvasY - shiftY)
        }
        return {
          dragStart: (e: any) => {
            const [x, y] = e.target.getPosition()
            shiftX = e.canvasX - x
            shiftY = e.canvasY - y

            moveAt(e.target, e.canvasX, e.canvasY)
          },
          drag: (e: any) => {
            moveAt(e.target, e.canvasX, e.canvasY)
          },
        }
      }
      // 注册拖拽
      [baseNode, iconNode, metric1Node, metric2Node, metric3Node, metric4Node].forEach((node) => {
        node.addEventListener('dragstart', updataNodePosition().dragStart)
        node.addEventListener('drag', updataNodePosition().drag)
        // node.addEventListener('dragend', updataNodePosition().dragEnd)
      })
    }
    init()
  })

  return (
    <>
      <div id="canvasdemo4" style={{ border: '1px solid' }}></div>
    </>
  )
}
