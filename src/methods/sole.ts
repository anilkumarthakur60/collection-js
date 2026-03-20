import { ItemNotFoundException } from '../exceptions'

export function sole<T>(
  items: T[],
  key?: keyof T | ((item: T, index: number) => boolean),
  value?: T[keyof T]
): T {
  if (key === undefined) {
    if (items.length !== 1) {
      throw new Error(
        items.length === 0
          ? 'No items found in the collection'
          : 'Multiple items found in the collection'
      )
    }
    return items[0]
  }

  let matches: T[]
  if (typeof key === 'function') {
    matches = items.filter(key)
  } else if (value !== undefined) {
    matches = items.filter((item) => item[key] === value)
  } else {
    matches = items.filter((item) => item[key])
  }

  if (matches.length === 0) throw new ItemNotFoundException('No items match the given criteria')
  if (matches.length > 1) throw new Error('Multiple items match the given criteria')
  return matches[0]
}
