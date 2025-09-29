export function forget<T>(items: T[], index: number | string | (number | string)[]): T[] {
  if (Array.isArray(index)) {
    const indices = index
    if (typeof indices[0] === 'number') {
      const numIndices = indices as number[]
      return items.filter((_, i) => !numIndices.includes(i))
    } else {
      const strKeys = indices as string[]
      return items.map((item) => {
        const itemCopy = { ...item } as Record<string, unknown>
        strKeys.forEach((k) => delete itemCopy[k])
        return itemCopy as T
      })
    }
  }

  if (typeof index === 'number') {
    if (index < 0 || index >= items.length) return [...items]
    return items.slice(0, index).concat(items.slice(index + 1))
  } else if (typeof index === 'string') {
    return items.map((item) => {
      const itemCopy = { ...item } as Record<string, unknown>
      delete itemCopy[index]
      return itemCopy as T
    })
  }
  return [...items]
}
