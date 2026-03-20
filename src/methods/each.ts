export function each<T>(items: T[], callback: (item: T, index: number) => void | boolean): void {
  for (let i = 0; i < items.length; i++) {
    if (callback(items[i], i) === false) break
  }
}

export function eachSpread<T>(
  items: T[],
  callback: (...args: T extends (infer R)[] ? R[] : T[]) => void | boolean
): void {
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const args = Array.isArray(item) ? item : [item]
    const result = callback(...(args as T extends (infer R)[] ? R[] : T[]))
    if (result === false) break
  }
}
