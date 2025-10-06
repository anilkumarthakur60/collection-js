export function unique<T>(items: T[], callback?: ((item: T) => unknown) | keyof T): T[] {
  if (typeof callback === 'function') {
    return items.filter(
      (item, index, self) => self.findIndex((i) => callback(i) === callback(item)) === index
    )
  }
  if (callback !== undefined) {
    const key = callback as keyof T
    return items.filter(
      (item, index, self) => self.findIndex((i) => i[key] === item[key]) === index
    )
  }
  return Array.from(new Set(items))
}
