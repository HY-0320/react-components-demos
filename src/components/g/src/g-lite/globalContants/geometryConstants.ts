//@ts-nocheck
import {
  CircleUpdater,
  EllipseUpdater,
  LineUpdater,
  PathUpdater,
  PolylineUpdater,
  RectUpdater,
  TextUpdater,
} from '../services/aabb'
import { Shape } from '../types';
import type {GeometryAABBUpdater} from '../services';
import { textService } from './textConstants';
/**
 * Replace with IoC container
 */
const geometryUpdaterFactoryConstructor: Record<Shape, GeometryAABBUpdater<any>> = (() => {
  const rectUpdater = new RectUpdater();
  const polylineUpdater = new PolylineUpdater();
  return {
    [Shape.CIRCLE]: new CircleUpdater(),
    [Shape.ELLIPSE]: new EllipseUpdater(),
    [Shape.RECT]: rectUpdater,
    [Shape.IMAGE]: rectUpdater,
    [Shape.GROUP]: rectUpdater,
    [Shape.LINE]: new LineUpdater(),
    [Shape.TEXT]: new TextUpdater(textService),
    [Shape.POLYLINE]: polylineUpdater,
    [Shape.POLYGON]: polylineUpdater,
    [Shape.PATH]: new PathUpdater(),
    [Shape.HTML]: null,
    [Shape.MESH]: null,
  };
})();

export const geometryUpdaterFactory:Record<Shape, GeometryAABBUpdater<any>> = geometryUpdaterFactoryConstructor;

export function patchGeometry(runtime: any) {
  runtime.geometryUpdaterFactory = geometryUpdaterFactory

}
