import type { DisplayObjectConfig } from '../dom';
import type { BaseStyleProps, ParsedBaseStyleProps } from '../types';
import { Shape } from '../types';
import { DisplayObject } from './DisplayObject';
import { enableCSSParsing } from '../globalContants/contants';

export interface ImageStyleProps extends BaseStyleProps {
  x?: number | string;
  y?: number | string;
  z?: number;
  img?: string | HTMLImageElement;
  src?: string | HTMLImageElement;
  width?: number | string;
  height?: number | string;
  isBillboard?: boolean;
}
export interface ParsedImageStyleProps extends ParsedBaseStyleProps {
  x: number;
  y: number;
  z?: number;
  img?: string | HTMLImageElement;
  src?: string | HTMLImageElement;
  width?: number;
  height?: number;
  isBillboard?: boolean;
}
export class Image extends DisplayObject<
  ImageStyleProps,
  ParsedImageStyleProps
> {
  constructor({ style, ...rest }: DisplayObjectConfig<ImageStyleProps> = {}) {
    super({
      type: Shape.IMAGE,
      style: enableCSSParsing
        ? {
            x: '',
            y: '',
            img: '',
            width: '',
            height: '',
            ...style,
          }
        : {
            ...style,
          },
      ...rest,
    });
  }
}