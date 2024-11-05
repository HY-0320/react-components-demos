//@ts-nocheck
import type { LayoutRegistry } from './css';
import type { CSSProperty } from './css/CSSProperty';
import { PropertySyntax, StyleValueRegistry } from './css/interfaces';
import type { HTML } from './display-objects';
import { Camera } from './camera';
import type {
  GeometryAABBUpdater,
  SceneGraphSelector,
  SceneGraphService,
} from './services';
import { DefaultSceneGraphSelector } from './services/SceneGraphSelector';
import { DefaultSceneGraphService } from './services/SceneGraphService';
// import { OffscreenCanvasCreator } from './services/OffscreenCanvasCreator';
// import { TextService } from './services/TextService';
import { Shape } from './types';

export const runtime: GlobalRuntime = {} as GlobalRuntime;

export interface GlobalRuntime {
  CameraContribution: new () => Camera;
  AnimationTimeline: any;
  EasingFunction: (...args: any[]) => (t: number) => number;
  geometryUpdaterFactory: Record<Shape, GeometryAABBUpdater<any>>;
  styleValueRegistry: StyleValueRegistry;
  layoutRegistry: LayoutRegistry;
  CSSPropertySyntaxFactory: Record<
    PropertySyntax,
    Partial<CSSProperty<any, any>>
  >;
  globalThis: any;
  enableCSSParsing: boolean;
  nativeHTMLMap: WeakMap<HTMLElement, HTML>;
  // AnimationTimeline: new (doc: IDocument) => IAnimationTimeline;
  // offscreenCanvas: OffscreenCanvasCreator;
  // textService: TextService;
}

/**
 * Camera
 * `g-camera-api` will provide an advanced implementation
 */
runtime.CameraContribution = Camera;

/**
 * `g-web-animations-api` will provide an AnimationTimeline
 */
runtime.AnimationTimeline = null;

runtime.EasingFunction = null;

runtime.layoutRegistry = null;


// runtime.offscreenCanvas = new OffscreenCanvasCreator();

// runtime.nativeHTMLMap = new WeakMap();

// runtime.sceneGraphSelector = new DefaultSceneGraphSelector();

// runtime.sceneGraphService = new DefaultSceneGraphService(runtime);

// runtime.textService = new TextService(runtime);

// runtime.geometryUpdaterFactory = geometryUpdaterFactory;

// runtime.CSSPropertySyntaxFactory = CSSPropertySyntaxFactory;
//runtime.styleValueRegistry = new DefaultStyleValueRegistry();
// runtime.globalThis = getGlobalThis();
// runtime.enableCSSParsing = false;
