import { ShapeOptions } from '../interface'
import { lineEdge } from './edge'
import { runDashLine } from './edges/run-dash-line'
import { circleNode } from './node'
import Shape from './shape'

let hasRegisterInner = false

export function registerAllInnerNodeAndEdge() {
  Shape.registerNode('circle', circleNode)
  Shape.registerEdge('line', lineEdge)
  Shape.registerEdge('run-dash-line', runDashLine, 'line')

  hasRegisterInner = true
}

export function registerNode(
  shapeType: string,
  nodeDefinition: ShapeOptions,
  extendShapeType?: string
) {
  if (!hasRegisterInner) {
    registerAllInnerNodeAndEdge()
  }
  Shape.registerNode(shapeType, nodeDefinition, extendShapeType)
}

export function registerEdge(
  shapeType: string,
  nodeDefinition: ShapeOptions,
  extendShapeType?: string
) {
  if (!hasRegisterInner) {
    registerAllInnerNodeAndEdge()
  }
  Shape.registerEdge(shapeType, nodeDefinition, extendShapeType)
}
