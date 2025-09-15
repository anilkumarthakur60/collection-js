export function groupBy<T, K extends keyof T>(
  items: T[],
  key: K | ((item: T, index: number) => string)
): Record<string, T[]> {
  if (typeof key === 'function') {
    return items.reduce(
      (result, item, index) => {
        const groupKey = key(item, index)
        if (!result[groupKey]) result[groupKey] = []
        result[groupKey].push(item)
        return result
      },
      {} as Record<string, T[]>
    )
  }
  return items.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) result[groupKey] = []
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}
