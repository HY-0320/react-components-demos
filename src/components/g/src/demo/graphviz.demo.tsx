import React, { useEffect } from 'react'
import { Arrow, Graph } from '../g-graph'
import { Graphviz } from '@hpcc-js/wasm'

/**
 * ---
 * order: 0
 * title: 测试 Graphviz
 * ---
 * 测试.
 */
export default () => {
  useEffect(() => {
    const graph = new Graph({
      container: 'graphdemo2',
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
        style: {},
        type: 'line',
        endArrow: {
          path: Arrow.triangle(8, 8, 0),
        },
      },
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

    async function init() {
      const graphviz = await Graphviz.load()

      const dot = 'digraph G { Hello -> World }'
      const svg = graphviz.dot(dot)
      console.log(graphviz.version(), svg)
    }
    init()
  })

  return (
    <>
      <div id="graphdemo2" style={{ border: '1px solid' }}></div>
    </>
  )
}
