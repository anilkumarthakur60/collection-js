export function sort<T>(items: T[], callback?: (a: T, b: T) => number): T[] {
  if (callback) return [...items].sort(callback)
  return [...items].sort((a, b) => {
    if (a < b) return -1
    if (a > b) return 1
    return 0
  })
}

export function sortBy<T, K extends keyof T>(
  items: T[],
  key:
    | K
    | ((item: T, index: number) => unknown)
    | Array<[K, 'asc' | 'desc'] | ((a: T, b: T) => number)>
): T[] {
  if (Array.isArray(key)) {
    const sortOps = key as Array<[K, 'asc' | 'desc'] | ((a: T, b: T) => number)>
    return [...items].sort((a, b) => {
      for (const op of sortOps) {
        if (typeof op === 'function') {
          const result = op(a, b)
          if (result !== 0) return result
        } else {
          const [sortKey, direction] = op
          const aVal = a[sortKey]
          const bVal = b[sortKey]
          const cmp = aVal > bVal ? 1 : aVal < bVal ? -1 : 0
          if (cmp !== 0) return direction === 'desc' ? -cmp : cmp
        }
      }
      return 0
    })
  }

  if (typeof key === 'function') {
    const fn = key as (item: T, index: number) => unknown
    return [...items].sort((a, b) => {
      const aVal = fn(a, 0) as string | number
      const bVal = fn(b, 0) as string | number
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
    })
  }

  return [...items].sort((a, b) => (a[key] > b[key] ? 1 : -1))
}

export function sortByDesc<T, K extends keyof T>(
  items: T[],
  key: K | ((item: T, index: number) => unknown)
): T[] {
  if (typeof key === 'function') {
    const fn = key as (item: T, index: number) => unknown
    return [...items].sort((a, b) => {
      const aVal = fn(a, 0) as string | number
      const bVal = fn(b, 0) as string | number
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    })
  }
  return [...items].sort((a, b) => (a[key] > b[key] ? -1 : 1))
}

export function sortDesc<T>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    if (a > b) return -1
    if (a < b) return 1
    return 0
  })
}

export function sortKeys<T>(items: T[]): T[] {
  return items.map((item) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const sorted = Object.keys(item as Record<string, unknown>)
        .sort()
        .reduce(
          (acc, k) => {
            acc[k] = (item as Record<string, unknown>)[k]
            return acc
          },
          {} as Record<string, unknown>
        )
      return sorted as unknown as T
    }
    return item
  })
}

export function sortKeysDesc<T>(items: T[]): T[] {
  return items.map((item) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const sorted = Object.keys(item as Record<string, unknown>)
        .sort()
        .reverse()
        .reduce(
          (acc, k) => {
            acc[k] = (item as Record<string, unknown>)[k]
            return acc
          },
          {} as Record<string, unknown>
        )
      return sorted as unknown as T
    }
    return item
  })
}

export function sortKeysUsing<T>(items: T[], callback: (a: string, b: string) => number): T[] {
  return items.map((item) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const sorted = Object.keys(item as Record<string, unknown>)
        .sort(callback)
        .reduce(
          (acc, k) => {
            acc[k] = (item as Record<string, unknown>)[k]
            return acc
          },
          {} as Record<string, unknown>
        )
      return sorted as unknown as T
    }
    return item
  })
}
