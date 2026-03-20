import { Predicate } from '../types'

export function after<T>(
  items: T[],
  item: T | string | Predicate<T>,
  strict: boolean = false
): T | null {
  if (typeof item === 'function') {
    const predicate = item as Predicate<T>
    const index = items.findIndex((value, idx) => predicate(value, idx))
    return index >= 0 && index < items.length - 1 ? items[index + 1] : null
  }

  const index = items.findIndex((i) => (strict ? i === item : i == item))
  return index >= 0 && index < items.length - 1 ? items[index + 1] : null
}
