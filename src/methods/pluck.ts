import { getNestedValue } from '../internals'

export function pluck<T, K extends keyof T>(items: T[], key: K | string): T[K][] {
  const keyStr = String(key)
  if (keyStr.includes('.')) {
    return items.map((item) => getNestedValue(item, keyStr)) as T[K][]
  }
  return items.map((item) => item[key as K])
}

export function pluckWithKey<T, K extends keyof T, J extends keyof T>(
  items: T[],
  key: K | string,
  keyBy: J | string
): Record<string, T[K]> {
  const keyStr = String(key)
  const keyByStr = String(keyBy)
  const useDotKey = keyStr.includes('.')
  const useDotKeyBy = keyByStr.includes('.')

  const result: Record<string, T[K]> = {}
  items.forEach((item) => {
    const k = useDotKeyBy ? String(getNestedValue(item, keyByStr)) : String(item[keyBy as J])
    const v = useDotKey ? (getNestedValue(item, keyStr) as T[K]) : item[key as K]
    result[k] = v
  })
  return result
}
