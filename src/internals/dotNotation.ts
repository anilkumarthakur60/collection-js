import type { PlainObject } from '../types/core'

function isObject(value: unknown): value is PlainObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function flattenToDot(obj: PlainObject, prefix = ''): PlainObject {
  return Object.keys(obj).reduce((acc: PlainObject, k: string) => {
    const pre = prefix.length ? `${prefix}.` : ''
    const val = obj[k]
    if (isObject(val)) {
      Object.assign(acc, flattenToDot(val, pre + k))
    } else {
      acc[pre + k] = val
    }
    return acc
  }, {})
}

export function expandFromDot(obj: PlainObject): PlainObject {
  const result: PlainObject = {}
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('.')
    let current = result
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current) || !isObject(current[parts[i]])) {
        current[parts[i]] = {}
      }
      current = current[parts[i]] as PlainObject
    }
    current[parts[parts.length - 1]] = value
  }
  return result
}
