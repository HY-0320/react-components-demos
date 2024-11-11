import { Circle, Text, Image, Group } from '../../g-lite'

function getPercent(value: number, min: number, max: number) {
  const v = Number(value)
  if (isNaN(min) || isNaN(max) || isNaN(value)) {
    return 0
  }
  if (v < min || v > max || min >= max) {
    return 100
  }
  return (v - min) / (max - min)
}

export function getCirclNodeByType(type: 'text_node' | 'icon_node' | 'metric_node', cfg: any) {
  const defaultSize = cfg?.size ?? 50
  const defaultLineWidth = 4
  const defaultLabelPadding = 8
  const showLabel = cfg?.showLabel ?? true
  // 节点容器
  const containerGroup = new Group({
    style: {
      x: cfg.x,
      y: cfg.y,
      cursor: 'pointer',
      draggable: true,
    },
  })
  // 初始化 默认circle 容器
  const defaultCircle = new Circle({
    style: {
      r: defaultSize, // 默认大小
      stroke: cfg?.style?.stroke ?? '#0070cc', // 默认颜色
      fill: '#fff',
      lineWidth: defaultLineWidth,
      cursor: 'pointer',
      draggable: true,
    },
  })

  // label 容器
  const nodeLabel =
    showLabel &&
    new Text({
      style: {
        text: cfg.label, // 文本内容
        fontFamily: 'Avenir', // 字体
        fontSize: 14, // 字号
        fill: '#000', // 文本颜色
        textAlign: 'center', // 水平居中
        textBaseline: 'middle', // 垂直居中
        cursor: 'pointer',
        wordWrap: true, // 文本换行
        wordWrapWidth: defaultSize * 2 - 10,
        maxLines: 2,
        textOverflow: 'ellipsis',
      },
    })

  // icon类型节点
  if (type === 'icon_node' && cfg?.nodeInfo?.icon?.img) {
    const dist = defaultSize * Math.cos(Math.PI * (1 / 4))
    const icon = new Image({
      style: {
        width: dist * 2,
        height: dist * 2,
        img: cfg?.nodeInfo?.icon?.img,
        cursor: 'pointer',
        transformOrigin: 'center',
        transform: `translate(${-dist},${-dist})`
      },
    })
    containerGroup.appendChild(defaultCircle)
    containerGroup.appendChild(icon)
    // label 展示
    if (showLabel) {
      nodeLabel.setAttribute(
        'transform',
        `translateY(${defaultSize + defaultLineWidth + defaultLabelPadding})`
      ) // 相对于中心偏移量 r + circle linwidth + padding
      nodeLabel.setAttribute("textBaseline", 'top')
      containerGroup.appendChild(nodeLabel)
    }
    return containerGroup
  } else if (type === 'metric_node' && cfg?.metrics?.length > 0) {
    // metric 类型节点
    // 涉及计算
    // 相对于中心偏移量 r + circle linwidth + padding
    const { metrics } = cfg ?? {}
    let radius = defaultSize
    let metricsLength = metrics.length
    const metricsLabelNodes = [] as Text[]
    metrics.forEach((metric: any, index: number) => {
      if (index > 1) {
        return
      }
      const min = metric?.min ?? 0 // 最小值
      const max = metric?.max ?? 100 // 最大值
      const percent = getPercent(metric.value, min, max) // 计算比例
      const perimeter = 2 * Math.PI * radius // 周长
      const [valueLength, emtyLength] = [perimeter * percent, perimeter - perimeter * percent] // 计算圆环长度
      // 用来显示值
      const outerCircle = new Circle({
        style: {
          r: radius, // 默认大小
          stroke: metric?.strokeColor ?? '#F04864', // 值对应颜色
          fill: '#fff',
          lineWidth: defaultLineWidth,
          cursor: 'pointer',
          lineDash: [valueLength, emtyLength],
        },
      })
      // 用来填充空白
      const innerCircle = new Circle({
        style: {
          r: radius, // 默认大小
          stroke: cfg?.style?.stroke ?? '#0070cc', // 基准颜色
          fill: 'transparent',
          lineWidth: defaultLineWidth,
          cursor: 'pointer',
          lineDash: [emtyLength, valueLength],
          lineDashOffset: -valueLength,
        },
      })
      // 指标展示
      const showMetricName = metric?.name ?? false
      const label = showMetricName ? `${metric?.name}: ${metric?.formatValue}` : `${metric?.formatValue}`

      const text = new Text({
        style: {
          text: label, // 文本内容
          fontFamily: 'Avenir', // 字体
          fontSize: 12, // 字号
          fill: '#000', // 文本颜色
          textAlign: 'center', // 水平居中
          textBaseline: 'middle', // 垂直居中
          wordWrap: true, // 文本换行
          wordWrapWidth: (defaultSize - (metricsLength - 1) * 5) * 2 - 20,
          maxLines: 1,
          textOverflow: 'ellipsis',
        },
      })
      // 最多放两个指标
      if (metricsLength === 2) {
        text.setAttribute('transform', index === 0 ? 'translateY(-10)' : 'translateY(10)')
      }
      metricsLabelNodes.push(text)
      containerGroup.appendChild(outerCircle)
      containerGroup.appendChild(innerCircle)
      radius = radius - defaultLineWidth - 3
    })
    // metric 加入 containerGroup
    metricsLabelNodes.forEach((labelNode) => containerGroup.appendChild(labelNode))

    if (showLabel) {
      nodeLabel.setAttribute(
        'transform',
        `translateY(${defaultSize + defaultLineWidth + defaultLabelPadding})`
      ) // 相对于中心偏移量 r + circle linwidth + padding
      nodeLabel.setAttribute('textBaseline', 'top')
      containerGroup.appendChild(nodeLabel)
    }
  } else {
    containerGroup.append(defaultCircle)
    // 展示label
    if (showLabel) {
      containerGroup.appendChild(nodeLabel)
    }
    return containerGroup
  }

  return containerGroup
}