export function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key])
}

export function pluckWithKey<T, K extends keyof T, J extends keyof T>(
  items: T[],
  key: K,
  keyBy: J
): Record<string, T[K]> {
  const result: Record<string, T[K]> = {}
  items.forEach((item) => {
    result[String(item[keyBy])] = item[key]
  })
  return result
}
