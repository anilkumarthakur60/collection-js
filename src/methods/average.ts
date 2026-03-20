export function average<T>(items: T[], callback?: (item: T) => number): number {
  if (items.length === 0) return 0
  if (callback) {
    return items.reduce((acc, item) => acc + callback(item), 0) / items.length
  }
  return items.reduce((acc, item) => acc + Number(item), 0) / items.length
}
