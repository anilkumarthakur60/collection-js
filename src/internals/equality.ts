import type { PlainObject } from '../types'

export function isObject(value: unknown): value is PlainObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function deepClone<T>(item: T): T {
  if (item === null || typeof item !== 'object') return item
  if (Array.isArray(item)) return item.map(deepClone) as unknown as T
  const cloned: PlainObject = {}
  for (const key of Object.keys(item as PlainObject)) {
    cloned[key] = deepClone((item as PlainObject)[key])
  }
  return cloned as T
}

export function mergeObjects(obj1: PlainObject, obj2: PlainObject): PlainObject {
  const result: PlainObject = { ...obj1 }
  for (const key of Object.keys(obj2)) {
    const v1 = result[key]
    const v2 = obj2[key]
    if (Array.isArray(v1) && Array.isArray(v2)) {
      result[key] = mergeArrays(v1, v2)
    } else if (isObject(v1) && isObject(v2)) {
      result[key] = mergeObjects(v1, v2)
    } else {
      result[key] = v2
    }
  }
  return result
}

export function mergeArrays<T>(arr1: T[], arr2: T[]): T[] {
  if (arr1.every((i) => typeof i !== 'object') && arr2.every((i) => typeof i !== 'object')) {
    return arr1.concat(arr2)
  }
  const result: T[] = []
  const len = Math.max(arr1.length, arr2.length)
  for (let i = 0; i < len; i++) {
    if (i >= arr1.length) result.push(arr2[i])
    else if (i >= arr2.length) result.push(arr1[i])
    else result.push(mergeValues(arr1[i], arr2[i]))
  }
  return result
}

export function mergeValues<T>(v1: T, v2: T): T {
  if (Array.isArray(v1) && Array.isArray(v2)) return mergeArrays(v1, v2) as unknown as T
  if (isObject(v1) && isObject(v2)) return mergeObjects(v1, v2) as unknown as T
  return v2
}

export function isDeepEqual<T>(value: T, other: T): boolean {
  if (value === other) return true
  if (typeof value !== 'object' || value === null || typeof other !== 'object' || other === null) {
    return false
  }
  if (Array.isArray(value) && Array.isArray(other)) {
    if (value.length !== other.length) return false
    return value.every((v, i) => isDeepEqual(v, other[i]))
  }
  if (Array.isArray(value) !== Array.isArray(other)) return false
  const keysA = Object.keys(value as PlainObject)
  const keysB = Object.keys(other as PlainObject)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (
      !keysB.includes(key) ||
      !isDeepEqual((value as PlainObject)[key] as T, (other as PlainObject)[key] as T)
    ) {
      return false
    }
  }
  return true
}

export function getNestedValue(obj: unknown, path: string): unknown {
  if (path === '') return obj
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (typeof current !== 'object') return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}
