export function keyBy<T, K extends keyof T>(
  items: T[],
  key: K | ((item: T, index: number) => string)
): Record<string, T> {
  if (typeof key === 'function') {
    return items.reduce(
      (result, item, index) => {
        result[key(item, index)] = item
        return result
      },
      {} as Record<string, T>
    )
  }
  return items.reduce(
    (result, item) => {
      result[String(item[key])] = item
      return result
    },
    {} as Record<string, T>
  )
}
