import React, { useEffect } from 'react'
import { Canvas, Circle } from '../g-lite'
import { Renderer } from '../g-canvas'
import { Plugin as DragDrogPlugin } from '../g-plugin-dragndrop'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * ---
 * order: 0
 * title: 测试 canvas
 * ---
 * 测试.
 */
export default () => {
  useEffect(() => {
    const init = async () => {
      const canvasRenderer = new Renderer()
      canvasRenderer.registerPlugin(
        new DragDrogPlugin({
          isDocumentDroppable: true,
          isDocumentDraggable: true,
        })
      )

      const canvas = new Canvas({
        container: 'canvasdemo0',
        width: 600,
        height: 500,
        renderer: canvasRenderer as any,
      })

      await canvas.ready

      const circle = new Circle({
        style: {
          r: 50,
          fill: '#1890FF',
          stroke: '#F04864',
          lineWidth: 4,
          cursor: 'pointer',
          draggable: true,
        },
      })

      circle.setPosition(100, 100)
      canvas.appendChild(circle)

      circle.addEventListener('mouseenter', () => {
        circle.style.fill = '#2FC25B'
      })
      circle.addEventListener('mouseleave', () => {
        circle.style.fill = '#1890FF'
      })

      const camera = canvas.getCamera()
      canvas.addEventListener('drag', function (e: any) {
        if (e.target === canvas.document) {
          camera.pan(-e.movementX, -e.movementY)
        }
      })

      let shiftX = 0
      let shiftY = 0
      function moveAt(target: any, canvasX: any, canvasY: any) {
        target.setPosition(canvasX - shiftX, canvasY - shiftY)
      }

      circle.addEventListener('dragstart', function (e: any) {
        e.target.style.opacity = 0.5

        const [x, y] = e.target.getPosition()
        shiftX = e.canvasX - x
        shiftY = e.canvasY - y

        moveAt(e.target, e.canvasX, e.canvasY)
      })
      circle.addEventListener('drag', function (e: any) {
        moveAt(e.target, e.canvasX, e.canvasY)
      })
      circle.addEventListener('dragend', function (e: any) {
        e.target.style.opacity = 1
      })

      const circle1 = new Circle({
        style: {
          r: 50,
          fill: '#1890FF',
          stroke: '#F04864',
          lineWidth: 4,
          cursor: 'pointer',
          draggable: true,
          cx: 300,
          cy: 300,
        },
      })

      canvas.appendChild(circle1)

      await sleep(3000)

      const ai = circle1.animate(
        [
          {
            transform: 'scale(0)', // 起始关键帧
          },
          {
            transform: 'scale(1)', // 结束关键帧
          },
        ],
        {
          duration: 5000, // 持续时间
          iterations: Infinity,
          easing: 'cubic-bezier(0.250, 0.460, 0.450, 0.940)', // 缓动函数
          fill: 'both', // 动画处于非运行状态时，该图形的展示效果
        }
      )
      ai?.play()
    }
    init()
  })

  return (
    <>
      <div id="canvasdemo0" style={{ border: '1px solid' }}></div>
    </>
  )
}
