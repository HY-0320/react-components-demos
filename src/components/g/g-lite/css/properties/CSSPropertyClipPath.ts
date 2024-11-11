// @ts-nocheck
import type { DisplayObject } from '../../display-objects';
import { CSSKeywordValue } from '../cssom';
import type { CSSProperty } from '../CSSProperty';
import { sceneGraphService } from '../../globalContants/sceneGrpahContants'

/**
 * clipPath / textPath / offsetPath
 */
export class CSSPropertyClipPath
  implements Partial<CSSProperty<DisplayObject, DisplayObject>>
{
  calculator(
    name: string,
    oldPath: DisplayObject,
    newPath: DisplayObject,
    object: DisplayObject,
  ) {
    // unset
    if (newPath instanceof CSSKeywordValue) {
      newPath = null;
    }

    sceneGraphService.updateDisplayObjectDependency(
      name,
      oldPath,
      newPath,
      object,
    );

    if (name === 'clipPath') {
      // should affect children
      object.forEach((leaf) => {
        if (leaf.childNodes.length === 0) {
          sceneGraphService.dirtifyToRoot(leaf);
        }
      });
    }

    return newPath;
  }
}
