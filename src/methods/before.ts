import { Predicate } from '../types'

export function before<T>(items: T[], item: T | string | Predicate<T>, strict: boolean = false): T | null {
  if (typeof item === 'function') {
    const predicate = item as Predicate<T>
    for (let i = 1; i < items.length; i++) {
      if (predicate(items[i], i)) {
        return items[i - 1]
      }
    }
    return null
  } else {
    const index = items.findIndex((i) => (strict ? i === item : i == item))
    if (index === -1 || index === 0) {
      return null
    }
    return items[index - 1]
  }
}
