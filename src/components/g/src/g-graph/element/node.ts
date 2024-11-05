import { Circle, DisplayObject, Group } from '../../g-lite'
import { GLOBAL } from '../global'
import { globalConstants } from '../interface/constant'
import { ModelConfig, ShapeOptions } from '../interface/shape'
import { getCirclNodeByType } from '../util/getnode'

export const circleNode: ShapeOptions = {
  itemType: 'node',
  // 单个图形的类型
  shapeType: 'circle',
  options: {
    size: GLOBAL.defaultNode.size,
    style: {
      ...GLOBAL.defaultNode.style,
    },
  },
  draw(cfg: ModelConfig, group: Group): DisplayObject {
    const circle = new Circle({
      id: cfg.id,
      name: `${globalConstants.globalPrefix}-circle-node`,
      style: {
        cx: cfg.x,
        cy: cfg.y,
        r: cfg.size,
        ...(cfg.style as any),
      },
    })
    group.appendChild(circle)
    return circle
  },
  updatePosition(cfg: ModelConfig, group: Group): DisplayObject {
    const circle = group.children[0] as Circle
    circle.setPosition(cfg.x!, cfg.y)
    return circle
  },
}
// 圆形节点
export const graphCircleNode: ShapeOptions = {
  itemType: 'circle_node_test',
  options: {
  },
  draw(cfg: ModelConfig, group: Group): DisplayObject {
    const nodeType =
      ['text_node', 'icon_node', 'metric_node'].find((t) => t === cfg?.nodeType) || 'text_node'
    const GraphNode = getCirclNodeByType(nodeType as any, cfg)
    group.appendChild(GraphNode)
    // 用外层的圆作为 node shape
    // 保证所有连线在 node 上
    const circle = GraphNode.children[0] as Circle
    return circle
  },
  updatePosition(cfg: ModelConfig, group: Group): DisplayObject {
    const container = group.children[0] as Group
    container.setPosition(cfg.x!, cfg.y)
    return container.children[0] as Circle
  },
  setState(name, value, item) {
    const g = item.get('group') as Group
    const nodeContainer = g.children[0] as Group
    // 置灰非关联节点
    if (name === 'grayUnrelatedNodes') {
      const nodes = nodeContainer.children
      if (value) {
        nodes.forEach((node) => node.setAttribute('opacity', 0.3))
      } else {
        nodes.forEach((node) => node.setAttribute('opacity', 1))
      }
    }

    // 拖动时把zindex提高
    if(name === 'dragging'){
      if(value){
        // 拖动时层级为 5
        g.setAttribute('zIndex',5)
      } else {
        // 拖拽停止后 此时是被hover状态
        g.setAttribute('zIndex',3)
      }
    }
    // hover 时 提高关联节点zindex
    if(name === 'updateHoverNodeZIndex'){
      if(value){
        // hover时层级为 3
        g.setAttribute('zIndex',3)
      } else {
        g.setAttribute('zIndex',1)
      }
    }
  },
}