import { ISanKeyLink, ISanKeyNode } from "./types";

export function getSankeyNodesAndLinks(sankeyLinksData: ISanKeyLink[]) {
  const nodes = [] as ISanKeyNode[];
  const links = [] as ISanKeyLink[];
  const linkMap = new Map();
  if (sankeyLinksData?.length > 0) {
    const nodeMap = new Map();
    for (let i = 0; i < sankeyLinksData.length; i++) {
      const { source, target, sourceConfig, targetConfig, getColor, ...res } =
        sankeyLinksData[i] ?? {};

      if (
        linkMap.has(`${source}_${target}`) ||
        linkMap.has(`${source}_${target}`)
      ) {
        // 一层环 简单过滤掉
        continue;
      } else {
        linkMap.set(`${source}_${target}`, i);
        links.push(sankeyLinksData[i]);
      }
      // 生成节点
      if (source && !nodeMap.has(source)) {
        const node = {
          id: source,
          config: sourceConfig,
          getColor,
          // field: res?.sourceField,
          ...res,
        };
        nodeMap.set(source, node);
        nodes.push(node);
      }

      if (target && !nodeMap.has(target) && target !== source) {
        const node = {
          id: target,
          config: targetConfig,
          field: res?.targetField,
          getColor,
          ...res,
        };
        nodeMap.set(target, node);
        nodes.push(node);
      }
    }
  }

  return {
    nodes,
    links,
  };
}
