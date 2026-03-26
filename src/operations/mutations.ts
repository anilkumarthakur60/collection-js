import { isPlainObject } from '../support/isObject'

/**
 * Pure-style mutation helpers — they always return a new array. Helpers that
 * also need a removed-value tuple (`pop`, `shift`, `splice`) return both pieces.
 */

export function pushOf<T>(items: readonly T[], values: readonly T[]): T[] {
  return [...items, ...values]
}

export function prependOf<T>(items: readonly T[], value: T): T[] {
  return [value, ...items]
}

export function concatOf<T, U>(items: readonly T[], other: readonly U[]): (T | U)[] {
  return [...items, ...other]
}

export function popOf<T>(items: readonly T[], count: number = 1): { remaining: T[]; removed: T[] } {
  if (count <= 0 || items.length === 0) return { remaining: [...items], removed: [] }
  const splitAt = Math.max(0, items.length - count)
  return { remaining: items.slice(0, splitAt), removed: items.slice(splitAt).reverse() }
}

export function shiftOf<T>(
  items: readonly T[],
  count: number = 1
): { remaining: T[]; removed: T[] } {
  if (count <= 0 || items.length === 0) return { remaining: [...items], removed: [] }
  const splitAt = Math.min(items.length, count)
  return { remaining: items.slice(splitAt), removed: items.slice(0, splitAt) }
}

export function spliceOf<T>(
  items: readonly T[],
  start: number,
  deleteCount?: number,
  replacements: readonly T[] = []
): { remaining: T[]; removed: T[] } {
  const copy = [...items]
  const removed =
    deleteCount === undefined
      ? copy.splice(start)
      : copy.splice(start, deleteCount, ...replacements)
  return { remaining: copy, removed }
}

export function pullOf<T>(
  items: readonly T[],
  target: T
): { remaining: T[]; removed: T | undefined } {
  const idx = items.indexOf(target)
  if (idx === -1) return { remaining: [...items], removed: undefined }
  const copy = [...items]
  const [removed] = copy.splice(idx, 1)
  return { remaining: copy, removed }
}

/**
 * `forget(key)` — supports numeric indexes (delete element at index) and
 * string keys (delete property from each object element).
 */
export function forgetOf<T>(items: readonly T[], keys: readonly (number | string)[]): T[] {
  const numericKeys = new Set<number>()
  const stringKeys = new Set<string>()
  for (const k of keys) {
    if (typeof k === 'number') numericKeys.add(k)
    else stringKeys.add(k)
  }

  let result: T[] = items.filter((_, i) => !numericKeys.has(i))
  if (stringKeys.size > 0) {
    result = result.map((item) => {
      if (!isPlainObject(item)) return item
      const out: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
        if (!stringKeys.has(k)) out[k] = v
      }
      return out as unknown as T
    })
  }
  return result
}

export function putOf<T extends object, K extends keyof T>(
  items: readonly T[],
  key: K,
  value: T[K]
): T[] {
  return items.map((item) => ({ ...item, [key]: value }) as T)
}

/** Recursive object merge (Laravel `mergeRecursive`). */
export function mergeRecursiveOf<T>(
  items: readonly T[],
  ...others: readonly (readonly T[])[]
): T[] {
  const merge = (a: unknown, b: unknown): unknown => {
    if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b]
    if (isPlainObject(a) && isPlainObject(b)) {
      const out: Record<string, unknown> = { ...(a as Record<string, unknown>) }
      for (const [k, v] of Object.entries(b as Record<string, unknown>)) {
        out[k] = k in out ? merge(out[k], v) : v
      }
      return out
    }
    if (a !== undefined && b !== undefined) return [a, b]
    return b ?? a
  }

  let result: unknown[] = [...items]
  for (const other of others) {
    const max = Math.max(result.length, other.length)
    const next: unknown[] = []
    for (let i = 0; i < max; i++) {
      if (i >= result.length) next.push(other[i])
      else if (i >= other.length) next.push(result[i])
      else next.push(merge(result[i], other[i]))
    }
    result = next
  }
  return result as T[]
}

/** Shallow merge: object-keyed merge if all are objects, else array concat. */
export function mergeOf<T, U>(items: readonly T[], other: readonly U[]): (T | U)[] {
  if (items.every((i) => isPlainObject(i)) && other.every((i) => isPlainObject(i))) {
    const merged: Record<string, unknown> = {}
    for (const item of items) Object.assign(merged, item as Record<string, unknown>)
    for (const item of other) Object.assign(merged, item as Record<string, unknown>)
    return [merged] as unknown as (T | U)[]
  }
  return [...items, ...other] as (T | U)[]
}
