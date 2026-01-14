import { dataGet } from './dataGet'

export type RetrieverInput<T, R = unknown> = ((item: T, index: number) => R) | keyof T | string

/**
 * Convert a key, dot-path, or function into a normalized accessor. Used by
 * groupBy, keyBy, sortBy, sum-with-key, etc. — any operation that accepts
 * either a callback or a property reference.
 */
export function valueRetriever<T, R = unknown>(
  source: RetrieverInput<T, R> | undefined
): (item: T, index: number) => R {
  if (source === undefined) {
    return (item: T) => item as unknown as R
  }
  if (typeof source === 'function') {
    return source as (item: T, index: number) => R
  }
  const key = String(source)
  if (key.includes('.') || key.includes('*')) {
    return (item: T) => dataGet(item, key) as R
  }
  return (item: T) => {
    if (item != null && typeof item === 'object') {
      return (item as Record<string, unknown>)[key] as R
    }
    return undefined as unknown as R
  }
}
