import { Predicate } from '../types'

export function all<T>(items: T[], predicate?: Predicate<T>): T[] {
  if (predicate) {
    return items.filter((item, index) => predicate(item, index))
  }
  return items
}
