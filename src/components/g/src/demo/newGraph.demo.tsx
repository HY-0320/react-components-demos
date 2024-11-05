import React, { useEffect, useRef, useState } from 'react'
import { Arrow, Graph, IEdge, INode } from '../g-graph'
import { EdgeData, NodeData } from './data'
import { Graphviz } from '@hpcc-js/wasm'
import _ from 'lodash'
import Shape from '../g-graph/element/shape'
import { graphCircleNode } from '../g-graph/element/node'
import { labelEdgeLine } from '../g-graph/element/edges/label-edge'

interface GraphvizLayout {
  [x: string]: any
  name: string
  objects: GraphvizNodeObject[]
  edges: any[]
}

interface GraphvizNodeObject {
  _gvid: number
  name: string
  _draw_: DrawItem[]
  _ldraw_: DrawItem[]
  color: string
  height: string
  label: string
  pos: string
  width: string
}

interface DrawItem {
  [x: string]: any
  op: string
  rect?: string
}

function nodeListTransformDot(nodeList: any, edgesList: any[]) {
  // let dotString = `digraph G {\ngraph[sep="20"]\nnode [shape=circle width=5]\n`
  // const nodeMap = getNodeMap(nodeList) // 存储节点id和子节点的对应关系
  // const edgesArray = []

  // // 遍历nodeList，生成节点和边
  // for (let i = 0; i < nodeList.length; i++) {
  //   const curNode = nodeList[i]
  //   let childNodes = curNode.childNodes
  //   // 保存当前节点
  //   if (nodeMap.has(curNode.id)) {
  //     dotString += `"${curNode.id}" [color=red label="${curNode.label}" fixedsize=true];\n`
  //   }

  //   for (let j = 0; j < childNodes.length; j++) {
  //     const node = childNodes[j]
  //     if (curNode.id !== node) {
  //       // 生成边
  //       edgesArray.push(`"${curNode.id}" -> "${node}"\n`)
  //     }
  //   }
  // }
  // dotString += edgesArray.join('') + '}'
  // return dotString
  let dotString = `digraph G {\ngraph[sep="1"]\nnode [shape=circle width=2 center=true]\n`
  const nodeMap = new Map() // 存储节点id和子节点的对应关系
  const edgesArray = []

  // 遍历edgesList, 生成节点和边
  for (let i = 0; i < edgesList.length; i++) {
    const edge = edgesList[i]
    const { target, source } = edge
    // 不存在或者相等
    if (!target || !source || target === source) {
      continue
    }
    // 添加节点
    if (!nodeMap.has(target)) {
      nodeMap.set(target, 1)
      const nodeInfo = nodeList.find((node: any) => node.id === target)
      dotString += `"${target}" [label="${nodeInfo?.label ?? target}" fixedsize=true];\n`
    }

    if (!nodeMap.has(source)) {
      nodeMap.set(source, 1)
      const nodeInfo = nodeList.find((node: any) => node.id === source)
      dotString += `"${source}" [label="${nodeInfo?.label ?? source}" fixedsize=true];\n`
    }
    edgesArray.push(`"${source}" -> "${target}"\n`)
  }
  dotString += `${edgesArray.join('')}}`
  return dotString
}

function transformGraphvizLayout2Nodes(
  nodeList: any[],
  layout: GraphvizLayout,
  widthDelta: number,
  heightDelta: number,
  initHeight: number,
  _initWidth: number
) {
  const { objects } = layout
  const _nodeList = []
  for (let i = 0; i < objects.length; i++) {
    const { pos, name } = objects[i]
    const [width, height] = pos.split(',').map(parseFloat)
    const nodeInfo = nodeList.find((node) => node.id === name)
    _nodeList.push({
      id: name,
      label: nodeInfo?.label ?? name,
      x: width * widthDelta,
      y: initHeight - height * heightDelta,
      showLabel: true,
      style: {
        rx: width * widthDelta,
        ry: initHeight - height * heightDelta,
      },
      nodeInfo,
      metrics: [
        {
          name: 'Metric1', // 指标名
          value: Math.random() * 10, // 指标值
          min: 0, // 最小值 默认0
          max: 10, // 最大值 默认100
          baseColor: '#00BFFF', // 基准颜色 阈值模式下生效
          strokeColor: '#00FF00', // 当前值对应颜色
        },
        {
          name: 'Metric2', // 指标名
          value: Math.random() * 10, // 指标值
          min: 0, // 最小值 默认0
          max: 10, // 最大值 默认100
          baseColor: '#00BFFF', // 基准颜色 阈值模式下生效
          strokeColor: '#00FF00', // 当前值对应颜色
        },
      ],
      showMertricName: true,
    })
  }
  return _nodeList
}

async function transformGraohvizLayout2Graph(
  nodeList: any[],
  edgeList: any[],
  initWidth: number,
  initHeight: number,
  type = 'dot' as any
) {
  try {
    // 初始化 Graphviz
    const graphviz = await Graphviz.load()
    // 生成相应的dot语言
    const dot = nodeListTransformDot(nodeList, edgeList)
    // 计算layout
    const layout = JSON.parse(graphviz.layout(dot, 'json', type))
    // 计算原声svg的宽高用作映射
    const svg = graphviz.layout(dot, 'svg', type)
    const svgElement = new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('svg')
    const viewBox = svgElement?.getAttribute('viewBox') ?? ''
    const [, , width, height] = viewBox.split(' ').map(parseFloat)
    const nodes = transformGraphvizLayout2Nodes(
      nodeList,
      layout,
      (initWidth / (width ?? 0)) * (96 / 72),
      (initHeight / (height ?? 0)) * (96 / 72),
      initHeight,
      initWidth
    )
    const edges = edgeList.map((edge) => ({
      source: edge.source,
      target: edge.target,
      style: edge.style,
      cref: edge,
    }))

    return {
      layout,
      nodes,
      edges,
    }
  } catch (error) {
    return {
      layout: {},
      nodes: [],
      edges: [],
    }
  }
}

function getNeighborsNodes(relatedEdges: IEdge[], curNode: INode): INode[] {
  const neighbors = [] as INode[]
  for (const edge of relatedEdges) {
    const source = edge.getSource()
    const target = edge.getTarget()

    if (source.getID() !== curNode.getID()) {
      neighbors.push(source)
    }

    if (target.getID() !== curNode.getID()) {
      neighbors.push(target)
    }
  }
  neighbors.push(curNode)
  return neighbors
}
let initGraph = false

/**
 * ---
 * order: 0
 * title: 测试 Graph
 * ---
 * 测试.
 */
export default () => {
  const graphRef = useRef<Graph>()
  const graphNodeDragRef = useRef<boolean>(false)
  const graphNodeHoverRef = useRef<INode | undefined> (undefined)
  const [nodeType, setNodeType] = useState<'text_node' | 'icon_node' | 'metric_node'>(
    'text_node' as any
  )
  const [layoutType, setLayoutType] = useState<any>('fdp' as any)

    Shape.registerNode('circle_node_test', graphCircleNode, 'circle')
    Shape.registerEdge('label_line_test', labelEdgeLine, 'line')

  useEffect(() => {
    // 初始化graphviz
    const init = async (flag: boolean) => {
      if (flag) {
        graphRef.current?.clear()
      }
      const layout = await transformGraohvizLayout2Graph(NodeData, EdgeData, 800, 400, layoutType)
      console.log('layout', layout)
      const graph = new Graph({
        container: 'graphdemo3',
        fitView: true,
        fitCenter: true,
        layout: {},
        width: 800,
        height: 400,
        canvasDraggable: true,
        canvasWheelZoom: true,
        defaultNode: {
          type: 'circle_node_test',
          nodeType: nodeType,
        },
        defaultEdge: {
          style: {
            lineDash: [4, 2, 1, 2],
          },
          type: 'label_line_test',
          endArrow: {
            path: Arrow.triangle(8, 8, 0),
          },
        },
        behaviors: [{ type: 'drag-node' }],
      })

      graph.data({
        edges: layout.edges,
        nodes: layout.nodes,
      })
      graph.render() // 渲染图
      graph.fitView()
      // 鼠标进入事件
      graph.on('node:mouseenter', (e) => {
        if (graphNodeDragRef.current || graphNodeHoverRef.current) {
          return
        }
        e.stopPropagation()
        const curNode = e.item as INode
        graphNodeHoverRef.current = curNode
        console.log('curNode', curNode)

        if (curNode) {
          const edges = curNode.getEdges()
          const neighbors = getNeighborsNodes(edges, curNode)
          const allNodes = graphRef?.current?.getNodes() ?? []
          const allEdges = graphRef?.current?.getEdges() ?? []
          // 设置当前 node 节点层级 2hover状态
          curNode.setState('updateHoverNodeZIndex', true)
          // 遍历所有节点 对非关联节点置灰
          allNodes.forEach((node) => {
            if (
              node.getID() !== curNode.getID() &&
              !neighbors.find((n) => n.getID() === node.getID())
            ) {
              node.setState('grayUnrelatedNodes', true)
            }
          })
          // 遍历所有边 对所有关联边停止running 且恢复置灰
          allEdges.forEach((edge) => {
            if (!edges.find((e) => edge.getID() === e.getID())) {
              edge.setState('greyNoRelatedEdges', true)
            } else {
              // edge.setState('running', true)
              // edge.setState('showMetric', true)
              edge.setState('hoverRelateNode', true)
            }
          })
        }
        console.log('node:mouseenter', e)
      })
      // 鼠标离开事件
      graph.on('node:mouseleave', (e) => {
        if (graphNodeDragRef.current) {
          return
        }
        e.stopPropagation()
        const curNode = e.item as INode
        console.log(graphNodeHoverRef.current?.getID() + ' ' + curNode.getID())
        if (graphNodeHoverRef.current?.getID() !== curNode.getID()) {
          return
        }
        graphNodeHoverRef.current = undefined
        if (curNode) {
          const allEdges = graphRef?.current?.getEdges() ?? []
          const allNodes = graphRef?.current?.getNodes() ?? []
          const edges = curNode.getEdges()
          const neighbors = getNeighborsNodes(edges, curNode)
           // 取消当前 node 节点层级
           curNode.setState('updateHoverNodeZIndex', false)
          // 遍历所有节点 对非关联节点恢复
          allNodes.forEach((node) => {
            if (
              node.getID() !== curNode.getID() &&
              !neighbors.find((n) => n.getID() === node.getID())
            ) {
              node.setState('grayUnrelatedNodes', false)
            }
          })

          // 遍历所有边 对所有关联边停止running 且恢复置灰
          allEdges.forEach((edge) => {
            if (!edges.find((e) => edge.getID() === e.getID())) {
              edge.setState('greyNoRelatedEdges', false)
            } else {
              // edge.setState('running', false)
              // edge.setState('showMetric', false)
              edge.setState('hoverRelateNode', false)
            }
          })
        }
        console.log('node:mouseleave', e)
      })
      // 拖动开始事件
      graph.on('node:dragstart', () => {
        graphNodeDragRef.current = true
      })
      // 拖动结束事件
      graph.on('node:dragend', () => {
        graphNodeDragRef.current = false
      })

      graphRef.current = graph
      initGraph = true
    }
    init(initGraph)
  }, [nodeType, layoutType])

  return (
    <>
      <div>
        <button
          onClick={() => {
            setNodeType('text_node')
          }}
        >
          text node类型
        </button>
        <button
          onClick={() => {
            setNodeType('icon_node')
          }}
        >
          icon node类型
        </button>
        <button
          onClick={() => {
            setNodeType('metric_node')
          }}
        >
          metric node类型
        </button>
        <button
          onClick={() => {
            setLayoutType('fdp')
          }}
        >
          力导向布局
        </button>
        <button
          onClick={() => {
            setLayoutType('dot')
          }}
        >
          层次布局
        </button>
        <button
          onClick={() => {
            setLayoutType('circo')
          }}
        >
          圆形布局
        </button>
        <button
          onClick={() => {
            graphRef.current?.zoom(graphRef.current?.getZoom() + 0.2)
          }}
        >
          放大0.2
        </button>
        <button
          onClick={() => {
            graphRef.current?.zoom(graphRef.current?.getZoom() - 0.2)
          }}
        >
          缩小0.2
        </button>
        <button
          onClick={() => {
            graphRef.current?.fitCenter()
          }}
        >
          fitCenter
        </button>
        <button
          onClick={() => {
            graphRef.current?.fitView()
          }}
        >
          fitView
        </button>
      </div>
      <div id="graphdemo3" style={{ border: '1px solid' }}></div>
    </>
  )
}
