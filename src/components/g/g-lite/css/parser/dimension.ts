// @ts-nocheck
import { isNil, isNumber, isString } from '@antv/util';
import type { DisplayObject } from '../../display-objects';
import type { IElement } from '../../dom';
import { Shape } from '../../types';
import { memoize } from '../../utils/memoize';
import type { CSSStyleValue } from '../cssom';
import {
  CSSUnitValue,
  toCanonicalUnit,
  UnitType,
  unitTypeToString,
} from '../cssom';
import { getOrCreateUnitValue } from '../CSSStyleValuePool';

type LengthUnit = 'px' | '%' | 'em' | 'rem';
type AngleUnit = 'deg' | 'rad' | 'turn';
type Unit = LengthUnit | AngleUnit | '';

export function deg2turn(deg: number) {
  return deg / 360;
}

export function turn2deg(turn: number) {
  return 360 * turn;
}

export function parseDimension(
  unitRegExp: RegExp,
  string: string,
): CSSStyleValue | undefined {
  if (isNil(string)) {
    return getOrCreateUnitValue(0, 'px');
  }

  string = `${string}`.trim().toLowerCase();

  if (isFinite(Number(string))) {
    if ('px'.search(unitRegExp) >= 0) {
      return getOrCreateUnitValue(Number(string), 'px');
    } else if ('deg'.search(unitRegExp) >= 0) {
      return getOrCreateUnitValue(Number(string), 'deg');
    }
  }

  const matchedUnits: Unit[] = [];
  string = string.replace(unitRegExp, (match: string) => {
    matchedUnits.push(match as Unit);
    return 'U' + match;
  });
  const taggedUnitRegExp = 'U(' + unitRegExp.source + ')';

  return matchedUnits.map((unit) =>
    getOrCreateUnitValue(
      Number(
        string
          .replace(new RegExp('U' + unit, 'g'), '')
          .replace(new RegExp(taggedUnitRegExp, 'g'), '*0'),
      ),
      unit,
    ),
  )[0];
}

/**
 * <length>
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/length
 * length with only absolute unit, eg. 1px
 */
export const parseLength = memoize((css: string) => {
  return parseDimension(new RegExp('px', 'g'), css);
});

/**
 * <percentage>
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/percentage
 */
export const parserPercentage = memoize((css: string) => {
  return parseDimension(new RegExp('%', 'g'), css);
});

/**
 * length with absolute or relative unit,
 * eg. 1px, 0.7em, 50%, calc(100% - 200px);
 *
 * @see https://developer.mozilla.org/zh-CN/docs/Web/CSS/length-percentage
 */
// export const parseLengthOrPercentage = memoize((css: string): CSSUnitValue => {
//   if (isNumber(css) || isFinite(Number(css))) {
//     return getOrCreateUnitValue(Number(css), 'px');
//   }
//   return parseDimension(new RegExp('px|%|em|rem', 'g'), css) as CSSUnitValue;
// });

export const parseLengthOrPercentage = (css: string): CSSUnitValue => {
  if (isNumber(css) || isFinite(Number(css))) {
    // Number(css) is NaN
    return getOrCreateUnitValue(Number(css) || 0, 'px');
    // return Number(css);
  }
  return parseDimension(new RegExp('px|%|em|rem', 'g'), css) as CSSUnitValue;
};

export const parseAngle = memoize((css: string): CSSUnitValue => {
  return parseDimension(
    new RegExp('deg|rad|grad|turn', 'g'),
    css,
  ) as CSSUnitValue;
});

/**
 * merge CSSUnitValue
 *
 * @example
 * 10px + 20px = 30px
 * 10deg + 10rad
 * 10% + 20% = 30%
 */
export function mergeDimensions(
  left: CSSUnitValue,
  right: CSSUnitValue,
  target: IElement,
  nonNegative?: boolean,
  index = 0,
): [number, number, (value: number) => string] {
  let unit = '';
  let leftValue = left.value || 0;
  let rightValue = right.value || 0;

  const canonicalUnit = toCanonicalUnit(left.unit);
  const leftCanonicalUnitValue = left.convertTo(canonicalUnit);
  const rightCanonicalUnitValue = right.convertTo(canonicalUnit);

  if (leftCanonicalUnitValue && rightCanonicalUnitValue) {
    leftValue = leftCanonicalUnitValue.value;
    rightValue = rightCanonicalUnitValue.value;
    unit = unitTypeToString(left.unit);
  } else {
    // format '%' to 'px'
    if (CSSUnitValue.isLength(left.unit) || CSSUnitValue.isLength(right.unit)) {
      leftValue = convertPercentUnit(left, index, target as DisplayObject);
      rightValue = convertPercentUnit(right, index, target as DisplayObject);
      unit = 'px';
    }
  }
  // // format 'rad' 'turn' to 'deg'
  // if (CSSUnitValue.isAngle(left.unit) || CSSUnitValue.isAngle(right.unit)) {
  //   leftValue = convertAngleUnit(left);
  //   rightValue = convertAngleUnit(right);
  //   unit = 'deg';
  // }

  return [
    leftValue,
    rightValue,
    (value: number) => {
      if (nonNegative) {
        value = Math.max(value, 0);
      }
      return value + unit;
    },
  ];
}

export function convertAngleUnit(value: CSSUnitValue) {
  let deg = 0;
  if (value.unit === UnitType.kDegrees) {
    deg = value.value;
  } else if (value.unit === UnitType.kRadians) {
    deg = rad2deg(Number(value.value));
  } else if (value.unit === UnitType.kTurns) {
    deg = turn2deg(Number(value.value));
  }
  return deg;
}

export function parseDimensionArrayFormat(
  string: string | number | (string | number)[],
  size: number,
): number[] {
  let parsed: number[];

  if (Array.isArray(string)) {
    // [1, '2px', 3]
    parsed = string.map((segment) => Number(segment));
  } else if (isString(string)) {
    parsed = string.split(' ').map((segment) => Number(segment));
  } else if (isNumber(string)) {
    parsed = [string];
  }

  if (size === 2) {
    if (parsed.length === 1) {
      return [parsed[0], parsed[0]];
    } else {
      return [parsed[0], parsed[1]];
    }
  } else {
    if (parsed.length === 1) {
      return [parsed[0], parsed[0], parsed[0], parsed[0]];
    } else if (parsed.length === 2) {
      return [parsed[0], parsed[1], parsed[0], parsed[1]];
    } else if (parsed.length === 3) {
      return [parsed[0], parsed[1], parsed[2], parsed[1]];
    } else {
      return [parsed[0], parsed[1], parsed[2], parsed[3]];
    }
  }
}

export function parseDimensionArray(
  string: string | (string | number)[],
): CSSUnitValue[] {
  if (isString(string)) {
    // "1px 2px 3px"
    return string.split(' ').map((segment) => parseLengthOrPercentage(segment));
  } else {
    // [1, '2px', 3]
    return string.map((segment) => parseLengthOrPercentage(segment.toString()));
  }
}

// export function mergeDimensionList(
//   left: CSSUnitValue[],
//   right: CSSUnitValue[],
//   target: IElement | null,
// ): [number[], number[], (list: number[]) => string] | undefined {
//   if (left.length !== right.length) {
//     return;
//   }

//   const unit = left[0].unit;

//   return [
//     left.map((l) => l.value),
//     right.map((l) => l.value),
//     (values: number[]) => {
//       return values.map((n) => new CSSUnitValue(n, unit)).join(' ');
//     },
//   ];
// }

export function convertPercentUnit(
  valueWithUnit: CSSUnitValue,
  vec3Index: number,
  target: DisplayObject,
): number {
  if (valueWithUnit.value === 0) {
    return 0;
  }

  if (valueWithUnit.unit === UnitType.kPixels) {
    return Number(valueWithUnit.value);
  } else if (valueWithUnit.unit === UnitType.kPercentage && target) {
    const bounds =
      target.nodeName === Shape.GROUP
        ? target.getLocalBounds()
        : // : target.getGeometryBounds();
          target.geometry.contentBounds;
    return (valueWithUnit.value / 100) * bounds.halfExtents[vec3Index] * 2;
  }
  return 0;
}