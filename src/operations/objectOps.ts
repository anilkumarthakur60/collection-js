import { dataGet, dataSet } from '../support/dataGet'
import { deepClone } from '../support/deepClone'
import { isObjectLike, isPlainObject } from '../support/isObject'

export function pluckOf<T>(items: readonly T[], key: string, keyBy?: string): unknown[] | Record<string, unknown> {
  if (keyBy === undefined) return items.map((item) => dataGet(item, key))
  const out: Record<string, unknown> = {}
  for (const item of items) {
    const k = dataGet(item, keyBy)
    out[String(k)] = dataGet(item, key)
  }
  return out
}

export function onlyOf<T extends object>(items: readonly T[], keys: readonly (keyof T | string)[]): Partial<T>[] {
  const set = new Set(keys.map(String))
  return items.map((item) => {
    if (!isObjectLike(item)) return {} as Partial<T>
    const out: Record<string, unknown> = {}
    for (const k of set) {
      if (k in (item as Record<string, unknown>)) out[k] = (item as Record<string, unknown>)[k]
    }
    return out as Partial<T>
  })
}

export function exceptOf<T extends object>(items: readonly T[], keys: readonly (keyof T | string)[]): Partial<T>[] {
  const set = new Set(keys.map(String))
  return items.map((item) => {
    if (!isObjectLike(item)) return item as unknown as Partial<T>
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(item as Record<string, unknown>)) {
      if (!set.has(k)) out[k] = v
    }
    return out as Partial<T>
  })
}

export function selectOf<T extends object, K extends keyof T>(
  items: readonly T[],
  keys: K | readonly K[],
): Pick<T, K>[] {
  const list: readonly K[] = Array.isArray(keys) ? (keys as readonly K[]) : [keys as K]
  return items.map((item) => {
    const out = {} as Pick<T, K>
    for (const k of list) out[k] = item[k]
    return out
  })
}

export function flipOf(items: readonly unknown[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (let i = 0; i < items.length; i++) out[String(items[i])] = i
  return out
}

export function keysOf<T>(items: readonly T[]): string[] {
  if (items.length === 0) return []
  if (items.every((item) => isPlainObject(item))) {
    const merged = new Set<string>()
    for (const item of items) for (const k of Object.keys(item as Record<string, unknown>)) merged.add(k)
    return [...merged]
  }
  return items.map((_, i) => String(i))
}

export function dotOf(items: readonly unknown[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  const helper = (value: unknown, prefix: string): void => {
    if (isPlainObject(value)) {
      const entries = Object.entries(value as Record<string, unknown>)
      if (entries.length === 0) {
        out[prefix] = value
        return
      }
      for (const [k, v] of entries) helper(v, prefix === '' ? k : `${prefix}.${k}`)
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        out[prefix] = value
        return
      }
      for (let i = 0; i < value.length; i++) helper(value[i], prefix === '' ? String(i) : `${prefix}.${i}`)
    } else {
      out[prefix] = value
    }
  }

  if (items.length === 1 && isPlainObject(items[0])) helper(items[0], '')
  else helper(items, '')
  return out
}

export function undotOf(items: readonly unknown[]): Record<string, unknown> {
  const source =
    items.length === 1 && isPlainObject(items[0])
      ? (items[0] as Record<string, unknown>)
      : items.reduce<Record<string, unknown>>((acc, cur, idx) => {
          if (isPlainObject(cur)) {
            for (const [k, v] of Object.entries(cur as Record<string, unknown>)) acc[k] = v
          } else {
            acc[String(idx)] = cur
          }
          return acc
        }, {})
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(source)) dataSet(out, k, v)
  return out
}

export function replaceShallow<T>(items: readonly T[], replacements: Record<number, T>): T[] {
  const copy = [...items]
  for (const [k, v] of Object.entries(replacements)) {
    const idx = Number(k)
    if (Number.isInteger(idx) && idx >= 0) copy[idx] = v
  }
  return copy
}

export function replaceRecursiveOf<T>(items: readonly T[], patches: readonly unknown[]): T[] {
  const merge = (target: unknown, patch: unknown): unknown => {
    if (Array.isArray(target) && Array.isArray(patch)) {
      const out = [...target]
      for (let i = 0; i < patch.length; i++) out[i] = merge(out[i], patch[i])
      return out
    }
    if (isPlainObject(target) && isPlainObject(patch)) {
      const out: Record<string, unknown> = { ...(target as Record<string, unknown>) }
      for (const [k, v] of Object.entries(patch as Record<string, unknown>)) {
        out[k] = merge((target as Record<string, unknown>)[k], v)
      }
      return out
    }
    return patch === undefined ? target : patch
  }
  return merge(deepClone([...items]), [...patches]) as T[]
}
