// import { DefaultStyleValueRegistry } from "./css/StyleValueRegistry"
// import type { LayoutRegistry } from './css/interfaces';
// export const styleValueRegistry:DefaultStyleValueRegistry = new DefaultStyleValueRegistry()
// export const layoutRegistry: LayoutRegistry = null

import type { HTML } from '../display-objects';

const getGlobalThis = () => {
  // if (typeof globalThis !== 'undefined') return globalThis;
  if (typeof self !== 'undefined') return self;
  if (typeof window !== 'undefined') return window;
  // @ts-ignore
  if (typeof global !== 'undefined') return global;
  if (typeof this !== 'undefined') return this;
  throw new Error('Unable to locate global `this`');
};
export const enableCSSParsing:boolean = false
export const nativeHTMLMap: WeakMap<HTMLElement, HTML> = new WeakMap()
export const globalThis:any  = getGlobalThis()

export function patchConstants(runtime: any) {
  runtime.enableCSSParsing = enableCSSParsing
  runtime.nativeHTMLMap = nativeHTMLMap
  runtime.globalThis = globalThis

}
