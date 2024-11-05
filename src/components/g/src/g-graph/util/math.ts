import { Point } from '../../antv-util'
import { ICircle, IEllipse, IRect } from '../interface/type'

/**
 * 是否在区间内
 * @param   {number}       value  值
 * @param   {number}       min    最小值
 * @param   {number}       max    最大值
 * @return  {boolean}      bool   布尔
 */
const isBetween = (value: number, min: number, max: number) => value >= min && value <= max

/**
 * 获取两条线段的交点
 * @param  {Point}  p0 第一条线段起点
 * @param  {Point}  p1 第一条线段终点
 * @param  {Point}  p2 第二条线段起点
 * @param  {Point}  p3 第二条线段终点
 * @return {Point}  交点
 */
export const getLineIntersect = (p0: Point, p1: Point, p2: Point, p3: Point): Point | null => {
  const tolerance = 0.0001

  const E: Point = {
    x: p2.x - p0.x,
    y: p2.y - p0.y,
  }
  const D0: Point = {
    x: p1.x - p0.x,
    y: p1.y - p0.y,
  }
  const D1: Point = {
    x: p3.x - p2.x,
    y: p3.y - p2.y,
  }
  const kross: number = D0.x * D1.y - D0.y * D1.x
  const sqrKross: number = kross * kross
  const invertKross: number = 1 / kross
  const sqrLen0: number = D0.x * D0.x + D0.y * D0.y
  const sqrLen1: number = D1.x * D1.x + D1.y * D1.y
  if (sqrKross > tolerance * sqrLen0 * sqrLen1) {
    const s = (E.x * D1.y - E.y * D1.x) * invertKross
    const t = (E.x * D0.y - E.y * D0.x) * invertKross
    if (!isBetween(s, 0, 1) || !isBetween(t, 0, 1)) return null
    return {
      x: p0.x + s * D0.x,
      y: p0.y + s * D0.y,
    }
  }
  return null
}

/**
 * get point and circle inIntersect
 * @param {ICircle} circle 圆点，x,y,r
 * @param {Point} point 点 x,y
 * @return {Point} applied point
 */
export const getCircleIntersectByPoint = (circle: ICircle, point: Point): Point | null => {
  const { x: cx, y: cy, r } = circle
  const { x, y } = point

  const dx = x - cx
  const dy = y - cy
  if (dx * dx + dy * dy < r * r) {
    return null
  }
  const angle = Math.atan(dy / dx)
  return {
    x: cx + Math.abs(r * Math.cos(angle)) * Math.sign(dx),
    y: cy + Math.abs(r * Math.sin(angle)) * Math.sign(dy),
  }
}

/**
 * get point and ellipse inIntersect
 * @param {Object} ellipse 椭圆 x,y,rx,ry
 * @param {Object} point 点 x,y
 * @return {object} applied point
 */
export const getEllipseIntersectByPoint = (ellipse: IEllipse, point: Point): Point => {
  const a = ellipse.rx
  const b = ellipse.ry
  const cx = ellipse.x
  const cy = ellipse.y

  const dx = point.x - cx
  const dy = point.y - cy
  // 直接通过 x,y 求夹角，求出来的范围是 -PI, PI
  let angle = Math.atan2(dy / b, dx / a)

  if (angle < 0) {
    angle += 2 * Math.PI // 转换到 0，2PI
  }

  return {
    x: cx + a * Math.cos(angle),
    y: cy + b * Math.sin(angle),
  }
}

/**
 * point and rectangular intersection point
 * @param  {IRect} rect  rect
 * @param  {Point} point point
 * @return {PointPoint} rst;
 */
export const getRectIntersectByPoint = (rect: IRect, point: Point): Point | null => {
  const { x, y, width, height } = rect
  const cx = x + width / 2
  const cy = y + height / 2
  const points: Point[] = []
  const center: Point = {
    x: cx,
    y: cy,
  }
  points.push({
    x,
    y,
  })
  points.push({
    x: x + width,
    y,
  })
  points.push({
    x: x + width,
    y: y + height,
  })
  points.push({
    x,
    y: y + height,
  })
  points.push({
    x,
    y,
  })
  let rst: Point | null = null
  for (let i = 1; i < points.length; i++) {
    rst = getLineIntersect(points[i - 1], points[i], center, point)
    if (rst) {
      break
    }
  }
  return rst
}
