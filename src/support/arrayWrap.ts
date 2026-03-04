import { isArrayable } from '../contracts/Arrayable'

/** Convert any iterable / Arrayable / single value into a plain array. */
export function toArray<T>(value: Iterable<T> | ArrayLike<T> | T): T[] {
  if (Array.isArray(value)) return value as T[]
  if (isArrayable<T>(value)) return value.toArray()
  if (value != null && typeof value === 'object' && Symbol.iterator in (value as object)) {
    return Array.from(value as Iterable<T>)
  }
  if (value != null && typeof value === 'object' && 'length' in (value as ArrayLike<T>)) {
    return Array.from(value as ArrayLike<T>)
  }
  return [value as T]
}

/** Wrap a non-array value into an array. Null/undefined become an empty array. */
export function arrayWrap<T>(value: T | T[] | null | undefined): T[] {
  if (value === null || value === undefined) return []
  return Array.isArray(value) ? (value as T[]) : [value as T]
}

/** Identity transform — preserves the input when already an array. */
export function ensureArray<T>(value: Iterable<T> | T[]): T[] {
  return Array.isArray(value) ? value : Array.from(value)
}
