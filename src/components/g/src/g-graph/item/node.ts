import { DisplayObject } from '../../g-lite'
import { ModelConfig } from '../interface'
import { IEdge, INode } from '../interface/item'
import { IPoint } from '../interface/type'
import {
  getCircleIntersectByPoint,
  getEllipseIntersectByPoint,
  getRectIntersectByPoint,
} from '../util/math'
import { Item } from './item'

export class Node extends Item implements INode {
  public getDefaultCfg() {
    return {
      type: 'node',
      edges: [],
    }
  }

  /**
   * 获取连接点
   * @param point
   */
  public getLinkPoint(point: IPoint): IPoint | null {
    const keyShape: DisplayObject = this.get('keyShape')
    const type: string = keyShape.nodeName

    const bbox = keyShape.getBBox()

    const centerX = bbox.left + bbox.width / 2
    const centerY = bbox.top + bbox.height / 2

    let intersectPoint: IPoint | null
    switch (type) {
      case 'circle':
        intersectPoint = getCircleIntersectByPoint(
          {
            x: centerX!,
            y: centerY!,
            r: bbox.width / 2,
          },
          point
        )
        break
      case 'ellipse':
        intersectPoint = getEllipseIntersectByPoint(
          {
            x: centerX!,
            y: centerY!,
            rx: bbox.width / 2,
            ry: bbox.height / 2,
          },
          point
        )
        break
      default:
        intersectPoint = getRectIntersectByPoint(
          {
            x: bbox.left,
            y: bbox.top,
            width: bbox.width,
            height: bbox.height,
          },
          point
        )
    }
    let linkPoint = intersectPoint

    if (linkPoint == null) {
      // 如果最终依然没法找到锚点和连接点，直接返回中心点
      linkPoint = { x: centerX, y: centerY } as IPoint
    }

    return linkPoint
  }

  /**
   * add edge
   * @param edge Edge instance
   */
  public addEdge(edge: IEdge) {
    this.get('edges').push(edge)
  }

  /**
   * 获取从节点关联的所有边
   */
  public getEdges(): IEdge[] {
    return this.get('edges')
  }

  /**
   * 移除边
   * @param {Edge} edge 边
   */
  public removeEdge(edge: IEdge) {
    const edges = this.getEdges()
    const index = edges.indexOf(edge)
    if (index > -1) edges.splice(index, 1)
  }

  /**
   * 获取节点的中心点
   */
  public getPosition() {
    const model: ModelConfig = this.get('model')
    return {
      x: model.x!,
      y: model.y!,
    }
  }

  /**
   * 获取节点的兄弟节点
   */
  public getNeighbors(type?: 'source' | 'target' | undefined) {
    const edges = this.get('edges')
    const nodeId = this.get('id')
    const neighbors = [] as INode[]
    for (const edge of edges) {
      const source = edge.getSource()
      const target = edge.getTarget()
      // id 相同 且没有type限制
      if (source.getID() !== nodeId && type !== 'target') {
        neighbors.push(source)
      }
      // id 相同 且没有type限制
      if (target.getID() !== nodeId && type !== 'source') {
        neighbors.push(target)
      }
    }
    return neighbors
  }

  // getNeighbors: (type?: 'source' | 'target' | undefined) => INode[]
}
