import { isPlainObject } from './isObject'

export function deepClone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as unknown as T
  if (Array.isArray(value)) return value.map(deepClone) as unknown as T
  if (isPlainObject(value)) {
    const out: Record<string, unknown> = {}
    for (const key of Object.keys(value)) {
      out[key] = deepClone((value as Record<string, unknown>)[key])
    }
    return out as T
  }
  // Fall through for class instances, Maps, Sets, etc.: return as-is.
  return value
}
