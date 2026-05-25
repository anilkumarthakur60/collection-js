import { deepEqual, looseEqual } from '../support/deepEqual'
import { isObjectLike } from '../support/isObject'

export function diffOf<T>(items: readonly T[], other: readonly T[]): T[] {
  return items.filter((item) => !other.some((o) => looseEqual(item, o)))
}

export function diffAssocOf<T>(items: readonly T[], other: readonly Partial<T>[]): T[] {
  if (items.length === 0) return []
  // Collection diffAssoc operates on key/value pairs of an object — flatten the
  // single object case Laravel uses, while preserving array-of-objects element
  // semantics for our TS API.
  const otherEntries =
    other[0] && isObjectLike(other[0]) ? Object.entries(other[0] as Record<string, unknown>) : []
  return items.filter((item) => {
    if (!isObjectLike(item)) return true
    const obj = item as Record<string, unknown>
    return Object.entries(obj).some(([k, v]) => {
      const match = otherEntries.find(([ok]) => ok === k)
      return !match || !looseEqual(match[1], v)
    })
  })
}

export function diffAssocUsingOf<T>(
  items: readonly T[],
  other: readonly T[],
  comparator: (a: T, b: T) => number
): T[] {
  return items.filter((item) => !other.some((o) => comparator(item, o) === 0))
}

export function diffKeysOf<T extends object>(
  items: readonly T[],
  otherKeys: readonly (keyof T | string)[]
): T[] {
  const set = new Set(otherKeys.map(String))
  return items.map((item) => {
    if (!isObjectLike(item)) return item
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      if (!set.has(k)) out[k] = v
    }
    return out as unknown as T
  })
}

export function intersectOf<T>(items: readonly T[], other: readonly T[]): T[] {
  return items.filter((item) => other.some((o) => looseEqual(item, o)))
}

export function intersectUsingOf<T>(
  items: readonly T[],
  other: readonly T[],
  comparator: (a: T, b: T) => number
): T[] {
  return items.filter((item) => other.some((o) => comparator(item, o) === 0))
}

export function intersectAssocOf<T extends object>(
  items: readonly T[],
  other: readonly Partial<T>[]
): T[] {
  if (items.length === 0) return []
  const flat = other[0] && isObjectLike(other[0]) ? (other[0] as Record<string, unknown>) : {}
  return items.map((item) => {
    if (!isObjectLike(item)) return item
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      if (Object.prototype.hasOwnProperty.call(flat, k) && looseEqual(flat[k], v)) out[k] = v
    }
    return out as unknown as T
  })
}

export function intersectAssocUsingOf<T extends object>(
  items: readonly T[],
  other: Record<string, unknown>,
  comparator: (a: string, b: string) => number
): T[] {
  if (items.length === 0) return []
  return items.map((item) => {
    if (!isObjectLike(item)) return item
    const obj = item as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(obj)) {
      const match = Object.entries(other).find(
        ([ok, ov]) => comparator(ok, k) === 0 && comparator(String(ov), String(v)) === 0
      )
      if (match) out[k] = v
    }
    return out as unknown as T
  })
}

export function intersectByKeysOf<T extends object>(
  items: readonly T[],
  otherKeys: readonly (keyof T | string)[]
): T[] {
  const set = new Set(otherKeys.map(String))
  return items.map((item) => {
    if (!isObjectLike(item)) return item
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      if (set.has(k)) out[k] = v
    }
    return out as unknown as T
  })
}

export function unionOf<T>(items: readonly T[], other: readonly T[]): T[] {
  // For mixed arrays, original wins by structural equality.
  const out: T[] = [...items]
  for (const o of other) {
    if (!out.some((i) => looseEqual(i, o))) out.push(o)
  }
  return out
}

/** Object-keyed union — original collection's keys take precedence. */
export function unionObjectsOf<T extends object>(items: readonly T[], other: readonly T[]): T[] {
  if (items.length === 0) return [...other]
  const merged = { ...(items[0] as Record<string, unknown>) }
  for (const o of other) {
    if (isObjectLike(o)) {
      for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
        if (!(k in merged)) merged[k] = v
      }
    }
  }
  return [merged as unknown as T]
}

export function crossJoinOf<T>(...arrays: readonly (readonly T[])[]): T[][] {
  if (arrays.length === 0) return []
  return arrays.reduce<T[][]>(
    (acc, arr) => {
      const next: T[][] = []
      for (const a of acc) for (const b of arr) next.push([...a, b])
      return next
    },
    [[]] as T[][]
  )
}

export function duplicatesOf<T>(
  items: readonly T[],
  by?: (item: T) => unknown,
  strict = false
): Map<number, T> {
  const seen: unknown[] = []
  const dupes = new Map<number, T>()
  for (let i = 0; i < items.length; i++) {
    const key = by ? by(items[i]) : items[i]
    const found = strict
      ? seen.some((s) => s === key || deepEqual(s, key))
      : seen.some((s) => looseEqual(s, key))
    if (found) dupes.set(i, items[i])
    else seen.push(key)
  }
  return dupes
}
