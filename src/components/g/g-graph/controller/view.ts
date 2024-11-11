import { IGraph } from '../interface/graph'
import { PointLike } from '../../g-lite'

export class ViewController {
  private graph: IGraph

  public destroyed: boolean = false

  constructor(graph: IGraph) {
    this.graph = graph
  }

  // @ts-ignore
  private getViewCenter(): PointLike {
    const { graph } = this
    const width: number = graph.get('width')
    const height: number = graph.get('height')
    return {
      x: width / 2,
      y: height / 2,
    }
  }
}
