import { Graphviz } from '@hpcc-js/wasm'
export type Engine = 'circo' | 'dot' | 'fdp' | 'sfdp' | 'neato' | 'osage' | 'patchwork' | 'twopi'

export { Graphviz }

import { Arrow, Graph } from './g-graph'
import type {IEdge, INode} from './g-graph'
import type { EdgeConfig, NodeConfig } from './g-graph'
import { Shape } from './g-graph/element/shape'
import { Circle, Text, Path, Image, Group, Line, Rect, DisplayObject } from './g-lite'
import type { IAnimation } from './g-lite'
import type { ModelConfig, ShapeOptions } from './g-graph/interface/shape'
import { GLOBAL } from './g-graph/global'
import { isPlainObject } from '@antv/util'

export {
  Arrow,
  GLOBAL,
  Graph,
  IEdge,
  INode,
  Shape,
  Circle,
  Path,
  Text,
  Image,
  Group,
  DisplayObject,
  Line,
  Rect,
  IAnimation,
  EdgeConfig,
  NodeConfig,
  ModelConfig,
  ShapeOptions,
  isPlainObject
}
