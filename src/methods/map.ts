export function map<T, U>(items: T[], callback: (item: T, index: number) => U): U[] {
  return items.map((item, index) => callback(item, index))
}

export function mapInto<T, U>(items: T[], ClassType: new (item: T) => U): U[] {
  try {
    return items.map((item) => new ClassType(item))
  } catch (error) {
    throw new Error(`${ClassType.name} is not a valid constructor for the provided items.`)
  }
}

export function mapSpread<T, U>(
  items: T[],
  callback: (...args: T extends (infer I)[] ? I[] : never) => U
): U[] {
  return items.map((item) => callback(...(item as T extends (infer I)[] ? I[] : never)))
}

export function mapToGroups<T, K extends string, V>(
  items: T[],
  callback: (item: T, index: number) => [K, V]
): Record<K, V[]> {
  return items.reduce<Record<K, V[]>>(
    (result, item, index) => {
      const [key, value] = callback(item, index)
      if (!result[key]) result[key] = []
      result[key].push(value)
      return result
    },
    {} as Record<K, V[]>
  )
}

export function mapWithKeys<T, K extends string, V>(
  items: T[],
  callback: (item: T, index: number) => [K, V]
): Record<K, V> {
  const result = {} as Record<K, V>
  items.forEach((item, index) => {
    const [key, value] = callback(item, index)
    result[key] = value
  })
  return result
}

export function flatMap<T, U>(items: T[], callback: (item: T) => U[]): U[] {
  const mapped = items.map(callback)
  return ([] as U[]).concat(...mapped)
}
