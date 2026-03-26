import { isDeepEqual } from '../internals'

export function intersect<T>(items: T[], values: T[]): T[] {
  return items.filter((item) => values.includes(item))
}

export function intersectUsing<T>(items: T[], values: T[], callback: (a: T, b: T) => number): T[] {
  return items.filter((item) => values.some((value) => callback(item, value) === 0))
}

export function intersectAssoc<T>(items: T[], values: T[]): T[] {
  return items.filter((item) => values.some((v) => isDeepEqual(item, v)))
}

export function intersectAssocUsing(
  items: unknown[],
  values: Record<string, unknown>,
  callback: (a: string, b: string) => number
): Record<string, unknown> {
  const merged: Record<string, unknown> = {}
  for (const item of items) {
    if (typeof item === 'object' && item !== null) {
      Object.assign(merged, item)
    }
  }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(merged)) {
    for (const [vKey, vValue] of Object.entries(values)) {
      if (callback(key, vKey) === 0 && value === vValue) {
        result[key] = value
      }
    }
  }
  return result
}
