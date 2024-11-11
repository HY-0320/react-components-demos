import { IGraph } from '../interface/graph'

export class LayoutController {
  public graph: IGraph

  public destroyed: boolean

  protected layoutCfg

  protected layoutType: string | string[]

  constructor(graph: IGraph) {
    this.graph = graph
    this.layoutCfg = graph.get('layout') || {}
    // this.layoutType = this.getLayoutType()

    this.initLayout()
  }

  // eslint-disable-next-line class-methods-use-this
  protected initLayout() {
    // no data before rendering
  }

  public layout() {
    return
  }
}
