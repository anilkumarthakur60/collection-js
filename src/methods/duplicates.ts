export function duplicates<T>(items: T[], key?: keyof T): T[] {
  const seen = new Map<T[keyof T] | T, T>()
  const dupes = new Set<T[keyof T] | T>()
  const result: T[] = []

  items.forEach((item) => {
    const value = key ? item[key] : item

    if (seen.has(value)) {
      if (!dupes.has(value)) {
        dupes.add(value)
        const original = seen.get(value)
        if (original) result.push(original)
      }
    } else {
      seen.set(value, item)
    }
  })

  return result
}

export function duplicatesStrict<T>(items: T[], key?: keyof T): T[] {
  const seen = new Map<T[keyof T], T[]>()
  const result: T[] = []

  items.forEach((item) => {
    const value = key ? item[key] : item

    if (seen.has(value as T[keyof T])) {
      seen.get(value as T[keyof T])!.push(item)
    } else {
      seen.set(value as T[keyof T], [item])
    }
  })

  seen.forEach((group) => {
    if (group.length > 1) {
      result.push(...group)
    }
  })

  return result
}
