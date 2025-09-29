import { isDeepEqual } from '../internals'

export function union<T>(items: T[], values: T[]): T[] {
  const unionItems = [...items]
  for (const value of values) {
    const exists = unionItems.some((item) => isDeepEqual(item, value))
    if (!exists) {
      unionItems.push(value)
    }
  }
  return unionItems
}
