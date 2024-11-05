import React from 'react'
import UPlot from 'uplot'
// import UPlotConfigBuilder from './uPlotConfigBuilder'

interface uPlotContextProps {
  plot: UPlot
  // config: UPlotConfigBuilder
  plotContainerRef: React.MutableRefObject<HTMLDivElement>
  plotCanvasRect: React.MutableRefObject<DOMRect>
}

export const uPlotContext = React.createContext<uPlotContextProps>(null as any)
