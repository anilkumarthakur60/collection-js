import type { ClassConstructor } from '../support/types'

export function mapOf<T, R>(items: readonly T[], fn: (item: T, index: number) => R): R[] {
  const out: R[] = new Array(items.length)
  for (let i = 0; i < items.length; i++) out[i] = fn(items[i], i)
  return out
}

export function mapIntoOf<T, R>(items: readonly T[], Ctor: ClassConstructor<R, [T]>): R[] {
  return items.map((item) => new Ctor(item))
}

export function mapSpreadOf<R>(
  items: ReadonlyArray<readonly unknown[]>,
  fn: (...args: readonly unknown[]) => R
): R[] {
  return items.map((item) => fn(...item))
}

export function mapToGroupsOf<T, K extends PropertyKey, V>(
  items: readonly T[],
  fn: (item: T, index: number) => readonly [K, V]
): Record<K, V[]> {
  const out = {} as Record<K, V[]>
  for (let i = 0; i < items.length; i++) {
    const [k, v] = fn(items[i], i)
    if (out[k] === undefined) out[k] = []
    out[k].push(v)
  }
  return out
}

export function mapWithKeysOf<T, K extends PropertyKey, V>(
  items: readonly T[],
  fn: (item: T, index: number) => readonly [K, V]
): Record<K, V> {
  const out = {} as Record<K, V>
  for (let i = 0; i < items.length; i++) {
    const [k, v] = fn(items[i], i)
    out[k] = v
  }
  return out
}

export function flatMapOf<T, R>(
  items: readonly T[],
  fn: (item: T, index: number) => R | readonly R[]
): R[] {
  const out: R[] = []
  for (let i = 0; i < items.length; i++) {
    const result = fn(items[i], i)
    if (Array.isArray(result)) out.push(...(result as R[]))
    else out.push(result as R)
  }
  return out
}

export function flattenOf(items: readonly unknown[], depth: number = Infinity): unknown[] {
  const out: unknown[] = []
  const helper = (arr: readonly unknown[], remaining: number): void => {
    for (const item of arr) {
      if (Array.isArray(item) && remaining > 0) helper(item, remaining - 1)
      else if (
        item !== null &&
        typeof item === 'object' &&
        Object.getPrototypeOf(item) === Object.prototype &&
        remaining > 0
      ) {
        helper(Object.values(item as Record<string, unknown>), remaining - 1)
      } else {
        out.push(item)
      }
    }
  }
  helper(items, depth)
  return out
}

export function collapseOf<T>(items: readonly (readonly T[] | T)[]): T[] {
  const out: T[] = []
  for (const entry of items) {
    if (Array.isArray(entry)) out.push(...(entry as T[]))
    else out.push(entry as T)
  }
  return out
}
