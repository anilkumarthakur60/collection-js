export function join<T>(items: T[], separator: string, finalSeparator?: string): string {
  if (!finalSeparator) return items.map(String).join(separator)
  if (items.length === 0) return ''
  if (items.length === 1) return String(items[0])
  const init = items.slice(0, -1).map(String).join(separator)
  return init + finalSeparator + String(items[items.length - 1])
}
