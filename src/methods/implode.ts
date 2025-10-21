export function implode<T>(
  items: T[],
  glue: string | ((item: T, index: number) => string),
  key?: keyof T
): string {
  if (typeof glue === 'function') {
    return items.map(glue).join(key ? String(key) : '')
  }
  if (key !== undefined) {
    return items.map((item) => String(item[key])).join(glue)
  }
  return items.map(String).join(glue)
}
