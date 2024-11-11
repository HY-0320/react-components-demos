//@ts-nocheck
import {
  CSSPropertyAngle,
  CSSPropertyClipPath,
  CSSPropertyColor,
  CSSPropertyFilter,
  CSSPropertyLengthOrPercentage,
  CSSPropertyLengthOrPercentage12,
  CSSPropertyLengthOrPercentage14,
  CSSPropertyLocalPosition,
  CSSPropertyMarker,
  CSSPropertyNumber,
  CSSPropertyOffsetDistance,
  CSSPropertyOpacity,
  CSSPropertyPath,
  CSSPropertyPoints,
  CSSPropertyShadowBlur,
  CSSPropertyText,
  CSSPropertyTextTransform,
  CSSPropertyTransform,
  CSSPropertyTransformOrigin,
  CSSPropertyZIndex,
} from '../css/properties'
import { PropertySyntax } from '../css/interfaces'
import type { CSSProperty } from '../css/CSSProperty'

const CSSPropertySyntaxFactoryConstructor: Record<
  PropertySyntax,
  Partial<CSSProperty<any, any>>
> = (() => {
  const color = new CSSPropertyColor()
  const length = new CSSPropertyLengthOrPercentage()
  return {
    [PropertySyntax.PERCENTAGE]: null,
    [PropertySyntax.NUMBER]: new CSSPropertyNumber(),
    [PropertySyntax.ANGLE]: new CSSPropertyAngle(),
    [PropertySyntax.DEFINED_PATH]: new CSSPropertyClipPath(),
    [PropertySyntax.PAINT]: color,
    [PropertySyntax.COLOR]: color,
    [PropertySyntax.FILTER]: new CSSPropertyFilter(),
    [PropertySyntax.LENGTH]: length,
    [PropertySyntax.LENGTH_PERCENTAGE]: length,
    [PropertySyntax.LENGTH_PERCENTAGE_12]: new CSSPropertyLengthOrPercentage12(),
    [PropertySyntax.LENGTH_PERCENTAGE_14]: new CSSPropertyLengthOrPercentage14(),
    [PropertySyntax.COORDINATE]: new CSSPropertyLocalPosition(),
    [PropertySyntax.OFFSET_DISTANCE]: new CSSPropertyOffsetDistance(),
    [PropertySyntax.OPACITY_VALUE]: new CSSPropertyOpacity(),
    [PropertySyntax.PATH]: new CSSPropertyPath(),
    [PropertySyntax.LIST_OF_POINTS]: new CSSPropertyPoints(),
    [PropertySyntax.SHADOW_BLUR]: new CSSPropertyShadowBlur(),
    [PropertySyntax.TEXT]: new CSSPropertyText(),
    [PropertySyntax.TEXT_TRANSFORM]: new CSSPropertyTextTransform(),
    [PropertySyntax.TRANSFORM]: new CSSPropertyTransform(),
    [PropertySyntax.TRANSFORM_ORIGIN]: new CSSPropertyTransformOrigin(),
    [PropertySyntax.Z_INDEX]: new CSSPropertyZIndex(),
    [PropertySyntax.MARKER]: new CSSPropertyMarker(),
  }
})()

export const CSSPropertySyntaxFactory: Record<
  PropertySyntax,
  Partial<CSSProperty<any, any>>
> = CSSPropertySyntaxFactoryConstructor



export function patchCSSPropertySyntax(runtime: any) {
  runtime.CSSPropertySyntaxFactory = CSSPropertySyntaxFactory
}
