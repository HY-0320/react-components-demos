import type { RendererConfig } from '../g-lite'
import { AbstractRenderer } from '../g-lite'
import * as CanvasPathGenerator from '../g-plugin-canvas-path-generator'
import * as CanvasPicker from '../g-plugin-canvas-picker'
import * as CanvasRenderer from '../g-plugin-canvas-renderer'
import * as DomInteraction from '../g-plugin-dom-interaction'
import * as HTMLRenderer from '../g-plugin-html-renderer'
import * as ImageLoader from '../g-plugin-image-loader'
import { ContextRegisterPlugin } from './ContextRegisterPlugin'
import '../g-camera-api'
import '../g-web-animations-api'

export {
  CanvasPathGenerator,
  CanvasPicker,
  CanvasRenderer,
  DomInteraction,
  HTMLRenderer,
  ImageLoader,
}

export class Renderer extends AbstractRenderer {
  constructor(config?: Partial<RendererConfig>) {
    super(config)

    // register Canvas2DContext
    this.registerPlugin(new ContextRegisterPlugin())
    this.registerPlugin(new ImageLoader.Plugin())
    this.registerPlugin(new CanvasPathGenerator.Plugin())
    // enable rendering with Canvas2D API
    this.registerPlugin(new CanvasRenderer.Plugin())
    this.registerPlugin(new DomInteraction.Plugin())
    // enable picking with Canvas2D API
    this.registerPlugin(new CanvasPicker.Plugin())

    // render HTML component
    this.registerPlugin(new HTMLRenderer.Plugin())
  }
}
