import { debounce } from '@antv/util'
import { GEvent, INode } from '../interface'
import { Behavior } from './behavior'

const debounceFun = debounce((x: number, y: number, dragitem: INode) => {
  dragitem.update(
    {
      x,
      y,
    },
    'move'
  )
  const edges = dragitem.getEdges()
  edges.forEach((edge) => {
    edge.update({})
  })
})

export function registerDragNode() {
  Behavior.registerBehaviorInner('drag-node', {
    getEvents: () => {
      return {
        'node:dragstart': 'onDragStart',
        'node:drag': 'onDrag',
        'node:dragend': 'onDragEnd',
      }
    },
    events: {
      onDragStart(e: GEvent) {
        if (e.item == null || e.item.getType() !== 'node') {
          return
        }
        this.dragstart = true
        this.dragitem = e.item as INode
        // 设置节点拖动状态的层级
        this.dragitem.setState('dragging', true)
        // 移动
        const { x, y } = this.dragitem.getPosition()
        this.shiftX = e.canvasX - x
        this.shiftY = e.canvasY - y
        this.moveTo(e.canvasX, e.canvasY)
      },
      onDrag(e: GEvent) {
        if (!this.dragstart) {
          return
        }
        this.moveTo(e.canvasX, e.canvasY)
      },
      onDragEnd(e: GEvent) {
        if (!this.dragstart) {
          return
        }
        // 恢复节点的层级
        this.dragitem.setState('dragging', false)
        this.moveTo(e.canvasX, e.canvasY)
        this.dragstart = false
        this.dragitem = null
      },
    },
    methods: {
      moveTo(canvasX: any, canvasY: any) {
        const newX = canvasX - this.shiftX
        const newY = canvasY - this.shiftY
        const debounceUpdate: any = this.debounceUpdate
        debounceUpdate(newX, newY, this.dragitem)
      },
      debounceUpdate: debounceFun,
    },
  })
}
