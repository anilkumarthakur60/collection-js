import type { Iteratee } from '../types'

export function countBy<T>(items: T[], iteratee?: Iteratee<T>): Record<string, number> {
  if (!iteratee) {
    return items.reduce((acc: Record<string, number>, item: T) => {
      const key = String(item)
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})
  }
  return items.reduce((acc: Record<string, number>, item: T) => {
    const key = String(iteratee(item))
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})
}
