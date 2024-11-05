import { Canvas, FederatedPointerEvent, Group, IElement, INode, IParentNode } from '../../g-lite'
import { GEvent, IItem } from '../interface'
import { globalConstants } from '../interface/constant'
import { IGraph } from '../interface/graph'

export class EventController {
  // @ts-ignore
  private graph: IGraph
  private canvasDragListener: any = null
  private canvasWheelZoomListener: any = null
  private preHoverItem: IItem | null

  public destroyed: boolean

  constructor(graph: IGraph) {
    this.graph = graph
    this.destroyed = false

    this.init()
  }

  init() {
    this.initCanvasEvent()
    this.setCanvasDraggable(this.graph.get('canvasDraggable'))
    this.setCanvasWheelZoom(this.graph.get('canvasWheelZoom'))
  }

  public destory() {
    this.setCanvasDraggable(false)
    const canvas: Canvas = this.graph.get('canvas')
    canvas.removeAllEventListeners()
    this.destroyed = true
  }

  /**
   * 处理画布拖动，TODO: 拖动需要限制范围
   * @param draggable asdf
   */
  public setCanvasDraggable(draggable: boolean) {
    const canvas: Canvas = this.graph.get('canvas')
    if (draggable && this.canvasDragListener == null) {
      const listener = (e: FederatedPointerEvent) => {
        const canvas: Canvas = this.graph.get('canvas')

        const camera = canvas.getCamera()
        if (e.target === canvas.document) {
          camera.pan(-e.movementX, -e.movementY)
        }
      }
      this.canvasDragListener = listener
      canvas.addEventListener('drag', listener)
    }
    if (!draggable && this.canvasDragListener != null) {
      canvas.removeEventListener('drag', this.canvasDragListener)
      this.canvasDragListener = null
    }
  }

  /**
   * 处理画布缩放
   * @param zoomable
   */
  public setCanvasWheelZoom(zoomable: boolean) {
    const canvas: Canvas = this.graph.get('canvas')
    if (zoomable && this.canvasWheelZoomListener == null) {
      const listener = (e: WheelEvent) => {
        const point = canvas.client2Viewport({ x: e.clientX, y: e.clientY })
        let zoom = this.graph.getZoom()
        if (e.deltaY > 0) {
          zoom *= 1 - 0.01 * 10
        } else {
          zoom *= 1 + 0.01 * 10
        }

        this.graph.zoom(zoom, { x: point.x, y: point.y })

        e.stopImmediatePropagation()
        e.preventDefault()
      }
      this.canvasWheelZoomListener = listener
      canvas
        .getContextService()!
        .getDomElement()!
        .addEventListener('wheel', listener, { passive: false })
    }
    if (!zoomable && this.canvasWheelZoomListener != null) {
      canvas
        .getContextService()!
        .getDomElement()!
        .removeEventListener('wheel', this.canvasWheelZoomListener)
      this.canvasWheelZoomListener = null
    }
  }

  private initCanvasEvent() {
    const canvas: Canvas = this.graph.get('canvas')
    canvas.addEventListener('click', this.handleCanvasEvent.bind(this))
    canvas.addEventListener('pointerover', this.handleCanvasEvent.bind(this))
    canvas.addEventListener('pointerout', this.handleCanvasEvent.bind(this))
    canvas.addEventListener('dragstart', this.handleCanvasEvent.bind(this))
    canvas.addEventListener('drag', this.handleCanvasEvent.bind(this))
    canvas.addEventListener('dragend', this.handleCanvasEvent.bind(this))
  }

  private handleCanvasEvent(e: GEvent) {
    // console.log(e)
    // console.log(e.target)
    // console.log(e.type + ' ' + (e as any).pointerType)

    const canvas: Canvas = this.graph.get('canvas')

    const type = e.type

    if (e.target == null) {
      return
    }

    if (e.target === canvas.document) {
      // canvas 上的 drag 事件额外处理
      if (type.startsWith('drag')) {
        return
      }
      // canvas 上的 pointer 事件另外监听
      if (type === 'pointerover' || type === 'pointerout') {
        this.handlePointerMove(e)
        return
      }
      // 空白处才触发 canvas 事件
      this.graph.emit(`canvas:${type}`, e)
      return
    }

    const target = e.target as IElement

    const item = this.getItem(target)
    e.item = item

    if (item == null) {
      return
    }

    const itemType = item.getType()
    if (target.name) {
      let emitType = type
      if (emitType === 'pointerout') {
        emitType = 'mouseleave'
      } else if (emitType === 'pointerover') {
        emitType = 'mouseenter'
      }
      this.graph.emit(`${target.name}:${emitType}`, e)
    }
    if (type === 'pointerover' || type === 'pointerout') {
      this.handlePointerMove(e)
      return
    }
    if (!e.propagationStopped && !e.propagationImmediatelyStopped) {
      // 模拟冒泡，如果 shape 阻止了冒泡，Item事件就不触发
      this.graph.emit(`${itemType}:${type}`, e)
    }
  }

  private handlePointerMove(e: GEvent) {
    const canvas: Canvas = this.graph.get('canvas')
    if (e.target === canvas.document) {
      if (this.preHoverItem != null) {
        // console.log(e.item?.getID() + ' mouseleave ' + ' 166')

        const itemType = this.preHoverItem.getType()

        this.graph.emit(`${itemType}:mouseleave`, e)
        this.preHoverItem = null
      }
      return
    }
    if (this.preHoverItem !== e.item) {
      let item = e.item
      if (this.preHoverItem != null) {
        const leaveItemType = this.preHoverItem.getType()
        e.item = this.preHoverItem
        this.graph.emit(`${leaveItemType}:mouseleave`, e)
        e.item = item
      }

      // console.log(e.item?.getID() + ' mouseenter ' + ' 174')
      const itemType = e.item!.getType()
      this.graph.emit(`${itemType}:mouseenter`, e)
      this.preHoverItem = e.item
    }
  }

  private isItemGroup(shape: IElement) {
    return (
      shape.name === globalConstants.edgeGroupName || shape.name === globalConstants.nodeGroupName
    )
  }

  private getItem(shape: IElement) {
    let parent: (INode & IParentNode) | null = shape
    while (parent != null && !this.isItemGroup(parent as IElement)) {
      parent = parent.parentNode
    }
    if (parent == null) {
      return null
    }
    const item: IItem | null = this.graph.get('itemMap')[(parent as Group).id]
    return item
  }
}
