import React, { useEffect, useRef } from 'react'
import { Arrow, Graph } from '../g-graph'

/**
 * ---
 * order: 0
 * title: 测试 Graph 边的功能
 * ---
 * 测试.
 */
export default () => {
  const graphRef = useRef<Graph>()

  useEffect(() => {
    const graph = new Graph({
      container: 'graphdemoedge',
      fitView: true,
      fitCenter: true,
      layout: {},
      width: 600,
      height: 500,
      defaultNode: {
        type: 'circle',
        size: 30,
        style: {
          cursor: 'pointer',
        },
      },
      defaultEdge: {
        style: {
          lineDash: [4, 2, 1, 2],
        },
        type: 'run-dash-line',
        endArrow: {
          path: Arrow.triangle(8, 8, 0),
        },
      },
    })

    graph.data({
      edges: [
        {
          id: 'id1-id2',
          source: 'id1',
          target: 'id2',
          style: {},
        },
      ],
      nodes: [
        {
          id: 'id1',
          x: 100,
          y: 100,
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

    graphRef.current = graph
  })

  return (
    <>
      <div>
        <button
          onClick={() => {
            graphRef.current?.setItemState('id1-id2', 'running', true)
          }}
        >
          run
        </button>
        <button
          onClick={() => {
            graphRef.current?.setItemState('id1-id2', 'running', false)
          }}
        >
          stop
        </button>
        <button
          onClick={() => {
            graphRef.current?.clearItemStates('id1-id2')
          }}
        >
          clear state
        </button>
      </div>
      <div id="graphdemoedge" style={{ border: '1px solid' }}></div>
    </>
  )
}
