import { useCallback, useEffect, useRef, useState } from "react";
import uPlot, { AlignedData, Options } from "uplot";

import { PlotProps } from "./types";

import "uplot/dist/uPlot.min.css";

function sameDims(prevProps: RepaintOptions, nextProps: RepaintOptions) {
  return (
    nextProps.width === prevProps.width && nextProps.height === prevProps.height
  );
}

function sameData(prevProps: PlotProps, nextProps: PlotProps) {
  return nextProps.data === prevProps.data;
}

function sameConfig(prevProps: PlotProps, nextProps: PlotProps) {
  return nextProps.config === prevProps.config;
}

type RepaintOptions = Omit<PlotProps, "plotRef" | "children">;

const UPlotChart = ({
  width,
  height,
  data,
  config,
  plotRef,
  children,
}: PlotProps) => {
  // uplot 实例
  const [plot, setPlot] = useState<uPlot | null>(null);

  // 缓存的配置
  const cachePlotProps = useRef<RepaintOptions | null>(null);
  //  ref去存最新的配置, 防止引起ref的更新
  const currentPlotProps = useRef<RepaintOptions>({
    width,
    height,
    data,
    config,
  });

  const plotContainer = useRef<HTMLDivElement>(null);

  const reinitPlot = useCallback(() => {
    // 销毁之前的实例
    plot?.destroy();

    const { width, height, config, data } = currentPlotProps.current;
    if (width === 0 && height === 0) {
      return;
    }

    // 添加钩子
    config.addHook("setSize", (u) => {
      const canvas = u.over;
      if (!canvas) {
        return;
      }
    });

    const configuration: Options = {
      width: Math.floor(width),
      height: Math.floor(height),
      ...config.getConfig(),
    };

    const newPlot = new uPlot(
      configuration,
      data as AlignedData,
      plotContainer!.current!
    );

    if (plotRef) {
      plotRef(newPlot);
    }

    setPlot(newPlot);
  }, [plot, plotRef]);

  // 每次渲染的时候判断一下是否需要重新初始化
  useEffect(() => {
    // 不存在配置信息就直接初始化
    if (!cachePlotProps.current) {
      reinitPlot();
    } else {
      // 判断是否需要重新初始化
      if (!sameDims(cachePlotProps.current, currentPlotProps.current)) {
        plot?.setSize({
          width: Math.floor(currentPlotProps.current.width),
          height: Math.floor(currentPlotProps.current.height),
        });
      } else if (!sameData(cachePlotProps.current, currentPlotProps.current)) {
        plot?.setData(currentPlotProps.current.data as AlignedData);
      } else if (
        !sameConfig(cachePlotProps.current, currentPlotProps.current)
      ) {
        reinitPlot();
      }
      // 更新缓存配置
      cachePlotProps.current = currentPlotProps.current;
    }
    return () => {
      // 组件卸载时销毁
      plot?.destroy();
    };
  });

  return (
    <div style={{ position: "relative" }}>
      <div ref={plotContainer} />
      {children}
    </div>
  );
};

export { UPlotChart };
