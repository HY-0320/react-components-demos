import { useLayoutEffect, useMemo, useState } from 'react'

export type UseObserverSizeRect = Pick<
  DOMRectReadOnly,
  'x' | 'y' | 'top' | 'left' | 'right' | 'bottom' | 'height' | 'width'
>
export type UseObserverSizeRef<E extends Element = Element> = (element: E) => void
export type UseObserverSizeResult<E extends Element = Element> = [
  UseObserverSizeRef<E>,
  UseObserverSizeRect,
  Element | null
]

const defaultState: UseObserverSizeRect = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  left: 0,
  bottom: 0,
  right: 0,
}

/**
 * 自定义 Hook，用于观察元素的大小变化。
 *
 * @template E - 元素类型，默认为 Element。
 * @returns {UseObserverSizeResult<E>} 包含引用回调、元素的尺寸信息和元素本身的数组。
 *
 * @example
 * ```typescript
 * const [ref, rect, element] = useObserverSize<HTMLDivElement>();
 * ```
 */
export function useObserverSize<E extends Element = Element>(): UseObserverSizeResult<E> {
  const [element, ref] = useState<E | null>(null)
  const [rect, setRect] = useState<UseObserverSizeRect>(defaultState)

  const observer = useMemo(
    () =>
      new (window as any).ResizeObserver((entries: any) => {
        if (entries[0]) {
          const { x, y, width, height, top, left, bottom, right } = entries[0].contentRect
          setRect({ x, y, width, height, top, left, bottom, right })
        }
      }),
    []
  )

  useLayoutEffect(() => {
    if (!element) return
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [element, observer])

  return [ref, rect, element]
}