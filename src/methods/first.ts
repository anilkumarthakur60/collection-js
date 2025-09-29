import { ItemNotFoundException } from '../exceptions'

export function first<T>(items: T[], predicate?: (item: T, index: number) => boolean): T | null {
  if (predicate) {
    for (let i = 0; i < items.length; i++) {
      if (predicate(items[i], i)) return items[i]
    }
    return null
  }
  return items.length > 0 ? items[0] : null
}

export function firstOrFail<T>(items: T[], predicate?: (item: T, index: number) => boolean): T {
  if (predicate) {
    for (let i = 0; i < items.length; i++) {
      if (predicate(items[i], i)) return items[i]
    }
    throw new ItemNotFoundException('No items found that match the predicate')
  }
  if (items.length > 0) return items[0]
  throw new ItemNotFoundException('No items found in the collection')
}

export function firstWhere<T, K extends keyof T>(
  items: T[],
  key: K,
  value?: T[K],
  operator: string = '==='
): T | null {
  if (value === undefined) {
    for (const item of items) {
      if (item[key]) return item
    }
  } else {
    for (const item of items) {
      if (value !== undefined && value !== null) {
        switch (operator) {
          case '===':
            if (item[key] === value) return item
            break
          case '!==':
            if (item[key] !== value) return item
            break
          case '<':
            if (item[key] < value) return item
            break
          case '<=':
            if (item[key] <= value) return item
            break
          case '>':
            if (item[key] > value) return item
            break
          case '>=':
            if (item[key] >= value) return item
            break
        }
      }
    }
  }
  return null
}
