import { IAnimation, Line } from '../../../g-lite'
import { ShapeOptions } from '../../interface/shape'

export const runDashLine: ShapeOptions = {
  setState(name, value, item) {
    const line: Line = item.get('keyShape')
    let dashAnimate: IAnimation | null = item.get('dashAnimate')

    if (name === 'running') {
      if (value) {
        if (dashAnimate == null) {
          dashAnimate = line.animate([{ lineDashOffset: 0 }, { lineDashOffset: -10 }], {
            duration: 500,
            iterations: Infinity,
          })
        }
        item.set('dashAnimate', dashAnimate)
        dashAnimate?.play()
      } else {
        if (dashAnimate) {
          dashAnimate.cancel()
        }
      }
    }

    // 置灰非相关边
    if (name === 'greyNoRelatedEdges') {
      if (value) {
        line.setAttribute('opacity', 0.3)
      } else {
        line.setAttribute('opacity', 1)
      }
    }
  },
}
