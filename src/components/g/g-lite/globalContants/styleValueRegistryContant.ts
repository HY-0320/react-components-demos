import { DefaultStyleValueRegistry } from '../css/StyleValueRegistry'

export const styleValueRegistry = new DefaultStyleValueRegistry()

export function patchStyleValueRegistry(runtime: any) {
  runtime.styleValueRegistry = styleValueRegistry
}
