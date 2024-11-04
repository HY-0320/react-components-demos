import React from "react";
import SankeyChart from "../sankeyChart"
import { ISanKeyLink } from "../types";
import { useObserverSize } from "@hooks";

/**
 * ---
 * order: 0
 * title: Sankey
 * ---
 * 桑吉图.
 */

// 获取随机柔和颜色数组
const getRandomSoftColors = (num: number): string[] => {
  const colors: string[] = [];
  for (let i = 0; i < num; i++) {
    // 生成柔和的颜色
    const r = Math.floor(Math.random() * 128 + 127); // 127-255
    const g = Math.floor(Math.random() * 128 + 127); // 127-255
    const b = Math.floor(Math.random() * 128 + 127); // 127-255

    // 将颜色转换为十六进制格式
    const color = `#${((1 << 24) + (r << 16) + (g << 8) + b)
      .toString(16)
      .slice(1)}`;
    colors.push(color);
  }
  return colors;
};

export const Demo = () => {
  const [ref, rect] = useObserverSize();
  const getColor = (
    _value: any,
    index: any,
    _config: any,
    _defaultColor: any
  ) => {
    const palette = getRandomSoftColors(20);
    return palette[index % palette.length];
  };

  const links = [
    { source: "A", target: "B", value: 10, getColor },
    { source: "A", target: "C", value: 5, getColor },
    { source: "B", target: "D", value: 7, getColor },
    { source: "C", target: "E", value: 3, getColor },
    { source: "D", target: "E", value: 10, getColor },
    { source: "B", target: "F", value: 4, getColor },
    { source: "C", target: "F", value: 6, getColor },
    { source: "E", target: "G", value: 8, getColor },
    { source: "F", target: "G", value: 2, getColor },
    { source: "G", target: "H", value: 9, getColor },
    { source: "E", target: "H", value: 5, getColor },
    { source: "H", target: "I", value: 7, getColor },
  ] as ISanKeyLink[];
  const width = rect?.width || 500;
  const height = rect?.height || 500;
  return (
    <div style={{ border: "1px solid red" }} ref={ref as any}>
      <SankeyChart
        width={width}
        height={height}
        dataSource={links}
        nodeWidth={10}
        extent={[
          [10, 10],
          [width - 10, height - 10],
        ]}
      />
    </div>
  );
};

export default Demo;
