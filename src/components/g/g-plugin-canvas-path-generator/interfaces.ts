import type { ParsedBaseStyleProps } from '../g-lite';

/**
 * generate path in local space
 */
export type PathGenerator<T extends ParsedBaseStyleProps> = (
  context: CanvasRenderingContext2D,
  attributes: T,
) => void;
