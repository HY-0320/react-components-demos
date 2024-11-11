export interface Indexable<T> {
  [key: string]: T
}

export interface IPoint {
  x: number
  y: number
  // 获取连接点时使用
  anchorIndex?: number
  [key: string]: number | undefined
}

export interface IRect extends IPoint {
  width: number
  height: number
}

export interface ICircle extends IPoint {
  r: number
}

export interface IEllipse extends IPoint {
  rx: number;
  ry: number;
}

export type SourceTarget = 'source' | 'target';
