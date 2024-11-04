import React, { useRef, memo, useMemo, useEffect, useCallback } from 'react'
import {
  sankey,
  sankeyJustify,
  sankeyLinkHorizontal,
  SankeyNode,
  SankeyLink,
  SankeyGraph,
  sankeyCenter,
  sankeyLeft,
  sankeyRight,
} from 'd3-sankey'
import { create, select } from 'd3-selection'
import { getSankeyNodesAndLinks } from './utils'
import { ISanKeyLink, ISanKeyNode, LinkColorMode, NodeAlignment } from './types'

interface ISankeyChartProps {
  width: number
  height: number
  dataSource: ISanKeyLink[]
  nodeWidth?: number
  nodePadding?: number
  /**
   * 布局的范围边界。
   * 范围边界指定为数组[[x0, y0]， [x1, y1]]
   * 其中x0为范围的左侧，y0为顶部，x1为右侧，y1为底部。默认值为[[0,0]，[1,1]]
   */
  extent?: [[number, number], [number, number]]
  /**
   * 节点对齐方式
   * left: 节点从左到右排列
   * right: 节点从右到左排列
   * center: 节点居中排列
   * justify: 节点两端对齐排列
   */
  align?: NodeAlignment
  /**
   * 连线颜色模式
   * left: 节点从左到右排列
   * right: 节点从右到左排列
   * center: 节点居中排列
   * justify: 节点两端对齐排列
   */
  linkColorMode?: LinkColorMode
  onNodeClick?: (node: ISanKeyNode, event: React.MouseEvent<SVGElement, MouseEvent>) => void
  onNodeMouseOver?: (node: ISanKeyNode, event: React.MouseEvent<SVGElement, MouseEvent>) => void
  onNodeMouseOut?: (node: ISanKeyNode, event: React.MouseEvent<SVGElement, MouseEvent>) => void
  onLinkClick?: (link: ISanKeyLink, event: React.MouseEvent<SVGElement, MouseEvent>) => void
  onLinkMouseOver?: (link: ISanKeyLink, event: React.MouseEvent<SVGElement, MouseEvent>) => void
  onLinkMouseOut?: (link: ISanKeyLink, event: React.MouseEvent<SVGElement, MouseEvent>) => void
}

export type SankeyNodeData = SankeyNode<ISanKeyNode, ISanKeyLink>
export type SankeyLinkData = SankeyLink<ISanKeyNode, ISanKeyLink>

const AliginMap = {
  left: sankeyLeft,
  right: sankeyRight,
  center: sankeyCenter,
  justify: sankeyJustify,
}

function SankeyChart({
  width,
  height,
  dataSource,
  nodeWidth = 5,
  nodePadding = 8,
  align = 'justify',
  linkColorMode = 'source',
  extent = [
    [0, 0],
    [1, 1],
  ],
  onNodeClick,
  onLinkClick,
  onNodeMouseOver,
  onLinkMouseOver,
  onNodeMouseOut,
  onLinkMouseOut,
}: ISankeyChartProps) {
  const sankeyContainerRef = useRef<HTMLDivElement>(null)
  const sankeyGeneratorError = useRef<Error | null>(null)

  const eventCache = useRef<{
    nodeClick?: (node: SankeyNodeData, event: React.MouseEvent<SVGElement, MouseEvent>) => void
    linkClick?: (node: SankeyLinkData, event: React.MouseEvent<SVGElement, MouseEvent>) => void
    nodeMouseOver?: (node: SankeyNodeData, event: React.MouseEvent<SVGElement, MouseEvent>) => void
    linkMouseOver?: (node: SankeyLinkData, event: React.MouseEvent<SVGElement, MouseEvent>) => void
    nodeMouseOut?: (node: SankeyNodeData, event: React.MouseEvent<SVGElement, MouseEvent>) => void
    linkMouseOut?: (node: SankeyLinkData, event: React.MouseEvent<SVGElement, MouseEvent>) => void
  }>({})

  eventCache.current = {
    nodeClick: onNodeClick,
    linkClick: onLinkClick,
    nodeMouseOver: onNodeMouseOver,
    linkMouseOver: onLinkMouseOver,
    nodeMouseOut: onNodeMouseOut,
    linkMouseOut: onLinkMouseOut,
  }

  const prepareSankeyData = useMemo(() => {
    return getSankeyNodesAndLinks(dataSource)
  }, [dataSource])

  // Sankey generator
  // 其中x0为范围的左侧，y0为顶部，x1为右侧，y1为底部。默认值为[[0,0]，[1,1]]。
  const sankeyGenerator = useMemo(() => {
    return sankey<ISanKeyNode, ISanKeyLink>()
      .nodeId((d) => d.id)
      .nodeAlign(AliginMap[align]) // d3.sankeyLeft, etc.
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      .extent(extent)
  }, [align, extent, nodePadding, nodeWidth])

  // sankeyGenerator 生成 nodes 和 links 数据
  const { nodes, links } = useMemo(() => {
    let result: SankeyGraph<ISanKeyNode, ISanKeyLink> = { nodes: [], links: [] }
    try {
      result = sankeyGenerator({
        nodes: prepareSankeyData.nodes.map((n) => ({ ...n })),
        links: prepareSankeyData.links.map((l) => ({ ...l })),
      })
      sankeyGeneratorError.current = null
    } catch (error) {
      // 可能会有环，不用报错
      sankeyGeneratorError.current = error
      // eslint-disable-next-line no-console
      console.error(error)
    }

    return result
  }, [prepareSankeyData.links, prepareSankeyData.nodes, sankeyGenerator])

  const handleRender = useCallback(() => {
    // 创建一个 svg container
    const svg = create('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto; font: 10px sans-serif;')

    // 绘制文本 最先绘制 因为可能不需要绘制， 防止挡住其他元素
    svg
      .append('g')
      .selectAll()
      .data(nodes)
      .join('text')
      .attr('x', (d) => ((d.x0 || 0) < width / 2 ? (d.x1 || 0) + 6 : (d.x0 || 0) - 6))
      .attr('y', (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => ((d.x0 || 0) < width / 2 ? 'start' : 'end'))
      .text((d) => d.id)

    // 绘制连线
    const link = svg
      .append('g')
      .attr('fill', 'none')
      .attr('stroke-opacity', 0.3)
      .selectAll()
      .data(links)
      .join('g')
      .style('mix-blend-mode', 'multiply')

    // 处理颜色
    let strokeColor: any = (d: SankeyLinkData) =>
      d.getColor?.(d.originValue, 0, d.numConfig, '#888')
    if (linkColorMode === 'target') {
      strokeColor = (d: any) => d.getColor(d.target.id, d.target.index, d.target.config)
    } else if (linkColorMode === 'source') {
      strokeColor = (d: any) => d.getColor(d.source.id, d.source.index, d.source.config)
    } else if (linkColorMode === 'source-target') {
      strokeColor = (d: any) => `url(#${d.source.id}@sls@${d.target.id})`
      const gradient = link
        .append('linearGradient')
        .attr('id', (d: any) => `${d.source.id}@sls@${d.target.id}`)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', (d: any) => d.source.x1)
        .attr('x2', (d: any) => d.target.x0)
      gradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', (d: any) => d.getColor(d.source.id, d.source.index, d.source.config))
      gradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', (d: any) => d.getColor(d.target.id, d.target.index, d.target.config))
    }

    // 处理link
    link
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', strokeColor)
      .attr('opracity', 0.3)
      .attr('stroke-width', (d) => Math.max(1, d.width || 0))

    // 绘制节点
    const rect = svg
      .append('g')
      .attr('stroke', '#000')
      .selectAll()
      .data(nodes)
      .join('rect')
      .attr('x', (d: SankeyNodeData) => d.x0 || 0)
      .attr('y', (d: SankeyNodeData) => d.y0 || 0)
      .attr('height', (d: SankeyNodeData) => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', (d: SankeyNodeData) => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', (d: SankeyNodeData, i: number) => d.getColor(d.id, i, d.config))

    /** 添加事件 */
    // 节点点击事件
    rect.on('click', (e: React.MouseEvent<SVGRectElement, MouseEvent>, d) => {
      const nodeClick = eventCache.current.nodeClick
      nodeClick && nodeClick(d, e)
    })

    rect.on('mouseover', (e: React.MouseEvent<SVGRectElement, MouseEvent>, d) => {
      const nodeMouseOver = eventCache.current.nodeMouseOver
      nodeMouseOver && nodeMouseOver(d, e)
    })

    rect.on('mouseout', (e: React.MouseEvent<SVGRectElement, MouseEvent>, d) => {
      const nodeMouseOut = eventCache.current.nodeMouseOut
      nodeMouseOut && nodeMouseOut(d, e)
    })

    link.on('click', (e: React.MouseEvent<SVGRectElement, MouseEvent>, d) => {
      const linkClick = eventCache.current.linkClick
      linkClick && linkClick(d, e)
    })
    link.on('mouseover', (e: React.MouseEvent<SVGRectElement, MouseEvent>, d) => {
      const linkMouseOver = eventCache.current.linkMouseOver
      linkMouseOver && linkMouseOver(d, e)
    })

    link.on('mouseout', (e: React.MouseEvent<SVGRectElement, MouseEvent>, d) => {
      const linkMouseOut = eventCache.current.linkMouseOut
      linkMouseOut && linkMouseOut(d, e)
    })

    const svgNode = svg.node()
    if (svgNode) {
      const container = sankeyContainerRef.current
      container!.appendChild(svgNode)
    }
  }, [height, linkColorMode, links, nodes, width])

  const handleRenderError = useCallback((error: Error | null) => {
    if (!error) {
      return null
    }
    let message = error.message ?? 'Unknown error'

    if (message === 'circular link') {
      message = '渲染失败'
    }
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          textAlign: 'center',
          alignContent: 'center',
          fontWeight: 700,
          color: 'red',
        }}
      >
        {message}
      </div>
    )
  }, [])

  useEffect(() => {
    const root = sankeyContainerRef.current
    if (root) {
      select(root).selectAll('svg').remove()
      if (nodes.length > 0 && links.length > 0 && !sankeyGeneratorError.current) {
        handleRender()
      }
    }
  }, [handleRender, links.length, nodes.length])

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        backgroundColor: '#FFF',
      }}
    >
      <div ref={sankeyContainerRef} />
      {handleRenderError(sankeyGeneratorError.current)}
    </div>
  )
}

export default memo(SankeyChart)
