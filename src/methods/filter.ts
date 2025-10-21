export function filter<T>(
  items: T[],
  callback?: (item: T, index: number, array: T[]) => boolean
): T[] {
  if (!callback) {
    return items.filter(Boolean)
  }
  return items.filter(callback)
}
