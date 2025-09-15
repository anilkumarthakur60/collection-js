import { isDeepEqual } from '../internals'

export function diff<T>(items: T[], other: T[]): T[] {
  return items.filter((item) => !other.some((otherItem) => isDeepEqual(item, otherItem)))
}

export function diffAssoc<T>(items: T[], values: T[]): T[] {
  return items.filter((item) => !values.some((value) => isDeepEqual(item, value)))
}

export function diffAssocUsing<T>(items: T[], values: T[], callback: (item: T) => unknown): T[] {
  return items.filter((item) => !values.some((value) => callback(value) === callback(item)))
}

export function diffKeys<T>(items: T[], otherKeys: Record<string, boolean>): T[] {
  return items.filter(
    (item) => !Object.keys(item as Record<string, T>).some((key) => otherKeys[key])
  )
}
