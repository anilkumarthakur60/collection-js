export function flip<T>(items: T[]): Record<string, number> {
  const flippedItems: Record<string, number> = {}
  items.forEach((value, index) => {
    if (typeof value === 'string' || typeof value === 'number') {
      flippedItems[String(value)] = index
    } else {
      throw new Error('Collection items must be of type string or number to flip.')
    }
  })
  return flippedItems
}
