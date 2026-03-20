export function dot<T>(items: T[]): Record<string, unknown> {
  const flatten = (obj: Record<string, unknown>, prefix = ''): Record<string, unknown> => {
    return Object.keys(obj).reduce(
      (acc, k) => {
        const pre = prefix.length ? prefix + '.' : ''
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
          Object.assign(acc, flatten(obj[k] as Record<string, unknown>, pre + k))
        } else {
          acc[pre + k] = obj[k]
        }
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  return items.reduce(
    (acc, item) => {
      if (typeof item === 'object' && item !== null) {
        Object.assign(acc, flatten(item as Record<string, unknown>))
      }
      return acc
    },
    {} as Record<string, unknown>
  )
}
