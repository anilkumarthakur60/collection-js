import type { Predicate, PredicateContains } from '../types'

export function contains<T>(items: T[], value: T | PredicateContains<T> | Partial<T>): boolean {
  if (typeof value === 'function') {
    return items.some(value as Predicate<T>)
  }

  if (typeof value === 'object' && value !== null) {
    return items.some((item) =>
      Object.keys(value as Record<string, unknown>).every(
        (key) => (item as Record<string, unknown>)[key] === (value as Record<string, unknown>)[key]
      )
    )
  }

  return items.includes(value as T)
}
