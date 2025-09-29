export function max<T>(items: T[], callback?: ((item: T) => number) | keyof T): number {
  if (typeof callback === 'function') {
    return Math.max(...items.map(callback))
  }
  if (callback !== undefined) {
    return Math.max(...items.map((item) => Number(item[callback])))
  }
  return Math.max(...items.map((item) => Number(item)))
}

export function min<T>(
  items: T[],
  callback?: ((item: T) => number) | keyof T
): T | number | undefined {
  if (items.length === 0) return undefined

  if (typeof callback === 'function') {
    let minItem: T | undefined = undefined
    let minValue = Infinity
    for (const item of items) {
      const value = callback(item)
      if (value < minValue) {
        minValue = value
        minItem = item
      }
    }
    return minItem
  }

  if (callback !== undefined) {
    return Math.min(...items.map((item) => Number(item[callback])))
  }

  let minItem = items[0]
  const rest = items.slice(1)
  for (const item of rest) {
    if (
      (typeof item === 'number' || typeof item === 'string') &&
      (typeof minItem === 'number' || typeof minItem === 'string')
    ) {
      if (item < minItem) minItem = item
    } else {
      throw new Error('Items must be number or string if no callback is provided to min().')
    }
  }
  return minItem
}

export function median<T>(items: T[], callback?: (item: T) => number): number {
  const sorted = callback
    ? items.map(callback).sort((a, b) => a - b)
    : [...items].sort((a, b) => Number(a) - Number(b))
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0
    ? (Number(sorted[middle - 1]) + Number(sorted[middle])) / 2
    : Number(sorted[middle])
}

export function mode<T>(items: T[], callback?: (item: T) => unknown): T | T[] | undefined {
  if (items.length === 0) return undefined

  const counts = new Map<string, { count: number; item: T }>()
  for (const item of items) {
    const keyValue = callback ? callback(item) : item
    let mapKey: string
    if (typeof keyValue === 'object' && keyValue !== null) {
      mapKey = JSON.stringify(keyValue)
    } else {
      mapKey = String(keyValue)
    }
    const entry = counts.get(mapKey)
    if (entry) {
      entry.count++
    } else {
      counts.set(mapKey, { count: 1, item })
    }
  }

  let maxCount = -Infinity
  for (const { count } of counts.values()) {
    if (count > maxCount) maxCount = count
  }

  const modeItems: T[] = []
  for (const { count, item } of counts.values()) {
    if (count === maxCount) modeItems.push(item)
  }

  return modeItems.length === 1 ? modeItems[0] : modeItems
}

export function sum<T>(items: T[], callback?: ((item: T) => number) | keyof T): number {
  if (!callback) {
    return items.reduce((acc, item) => acc + Number(item), 0)
  }
  if (typeof callback === 'function') {
    return items.reduce((acc, item) => acc + callback(item), 0)
  }
  return items.reduce((acc, item) => acc + Number(item[callback]), 0)
}

export function percentage<T>(
  items: T[],
  callback: (item: T) => boolean,
  precision: number = 2
): number {
  if (items.length === 0) return 0
  const count = items.filter(callback).length
  const result = (count / items.length) * 100
  return parseFloat(result.toFixed(precision))
}
