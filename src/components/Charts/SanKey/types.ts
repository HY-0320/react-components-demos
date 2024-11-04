import { SankeyLink, SankeyNode } from "d3-sankey";

// export interface ISanKeyLink {
//   source: string;
//   target: string;
//   value: number;
//   getColor?: (value: any, index: any, config: any, defaultColor: any) => string;
// }

interface ISanKeyNodeExtraProperties {
  [s: string]: any
  id: string | number | ISanKeyNode,
  config?: object,
}

interface ISanKeyLinkExtraProperties {
  [s: string]: any
  sourceConfig?: object
  targetConfig?: object
  getColor?: (value: any, index: any, config: any, defaultColor: any) => string

}

export type ISanKeyLink = SankeyLink<
  ISanKeyNodeExtraProperties,
  ISanKeyLinkExtraProperties
>;

export type ISanKeyNode = SankeyNode<ISanKeyNodeExtraProperties, ISanKeyLinkExtraProperties>

/**
 * left: 节点从左到右排列
 * right: 节点从右到左排列
 * center: 节点居中排列
 * justify: 节点两端对齐排列
 */
export type NodeAlignment = "left" | "right" | "center" | "justify";

/**
 * 连线颜色模式
 * source: 以source节点颜色为准
 * target: 以target节点颜色为准
 * source-target: 颜色从source到target渐变
 */
export type LinkColorMode = "source" | "target" | "source-target";
