export interface Arrayable<T> {
  toArray(): T[]
}

export function isArrayable<T>(value: unknown): value is Arrayable<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { toArray?: unknown }).toArray === 'function'
  )
}
