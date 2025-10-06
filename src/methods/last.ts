export function last<T>(
  items: T[],
  predicate?: (item: T, index: number) => boolean,
  errorFn?: () => void
): T | undefined {
  if (!predicate) return items[items.length - 1]

  for (let i = items.length - 1; i >= 0; i--) {
    if (predicate(items[i], i)) return items[i]
  }

  if (errorFn) errorFn()
  return undefined
}
