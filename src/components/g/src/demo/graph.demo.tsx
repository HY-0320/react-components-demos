import React, { useEffect, useRef } from 'react'
import { Arrow, Graph, ModelConfig, registerNode } from '../g-graph'
import { GEvent } from '../g-graph'
import { Circle, Group } from '../g-lite'

registerNode(
  'custom-demo-node',
  {
    afterDraw: (cfg: ModelConfig, group: Group) => {
      const circle = new Circle({
        name: `child-circle-node`,
        style: {
          cx: cfg.x,
          cy: cfg.y,
          r: 20,
          ...(cfg.style as any),
        },
      })
      group.appendChild(circle)
    },
    afterUpdatePosition(cfg: ModelConfig, group: Group) {
      const circle = group.children[1] as Circle
      circle.setPosition(cfg.x!, cfg.y)
    },
  },
  'circle'
)

/**
 * ---
 * order: 0
 * title: 测试 Graph
 * ---
 * 测试.
 */
export default () => {
  const graphRef = useRef<Graph>()

  useEffect(() => {
    const graph = new Graph({
      container: 'graphdemo1',
      fitView: true,
      fitCenter: true,
      layout: {},
      width: 600,
      height: 500,
      canvasDraggable: true,
      canvasWheelZoom: true,
      defaultNode: {
        type: 'custom-demo-node',
        size: 30,
        style: {
          cursor: 'pointer',
          draggable: true,
        },
      },
      defaultEdge: {
        style: {},
        type: 'line',
        endArrow: {
          path: Arrow.triangle(8, 8, 0),
        },
      },
      behaviors: [{ type: 'drag-node' }],
    })

    graph.data({
      edges: [
        {
          source: 'id1',
          target: 'id2',
          style: {},
        },
      ],
      nodes: [
        {
          id: 'id1',
          x: 300,
          y: 300,
          style: {},
        },
        {
          id: 'id2',
          x: 400,
          y: 400,
          style: {},
        },
      ],
    })
    graph.render() // 渲染图

    graph.on('canvas:click', (e) => {
      console.log(e)
    })

    graph.on('node:click', (e) => {
      console.log(e)
    })

    graph.on(`child-circle-node:click`, (e: GEvent) => {
      // 点击node某个节点后阻止 node:click
      console.log('child-circle-node:click', e)
      e.stopPropagation()
    })

    graph.on('node:mouseenter', (e) => {
      console.log('node:mouseenter', e)
    })

    graph.on('node:mouseleave', (e) => {
      console.log('node:mouseleave', e)
    })

    graph.on('child-circle-node:mouseenter', (e) => {
      console.log('child-circle-node:mouseenter', e)
    })

    graph.on('child-circle-node:mouseleave', (e) => {
      console.log('child-circle-node:mouseleave', e)
    })

    graphRef.current = graph
  })

  return (
    <>
      <div>
        <button
          onClick={() => {
            graphRef.current?.updateItem('id1', { x: 100, y: 100 }, 'move')
          }}
        >
          更新id1位置
        </button>
        <button
          onClick={() => {
            graphRef.current?.updateItem('id1', { x: 300, y: 300 }, 'move')
          }}
        >
          还原id1位置
        </button>
        <button
          onClick={() => {
            graphRef.current?.translate(50, 50)
          }}
        >
          右下平移50
        </button>
        <button
          onClick={() => {
            graphRef.current?.translate(-50, -50)
          }}
        >
          左上平移50
        </button>
        <button
          onClick={() => {
            graphRef.current?.zoom(graphRef.current?.getZoom() + 0.1)
          }}
        >
          放大0.1
        </button>
        <button
          onClick={() => {
            graphRef.current?.zoom(graphRef.current?.getZoom() - 0.1)
          }}
        >
          缩小0.1
        </button>
        <button
          onClick={() => {
            graphRef.current?.zoom(graphRef.current?.getZoom() + 0.1, { x: 350, y: 350 })
          }}
        >
          指定位置放大0.1
        </button>
        <button
          onClick={() => {
            graphRef.current?.zoom(graphRef.current?.getZoom() - 0.1, { x: 350, y: 350 })
          }}
        >
          指定位置缩小0.1
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
      <div id="graphdemo1" style={{ border: '1px solid' }}></div>
    </>
  )
}
