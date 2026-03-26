import { valueRetriever, type RetrieverInput } from '../support/valueRetriever'

export function groupByOf<T, K extends PropertyKey = PropertyKey>(
  items: readonly T[],
  by: RetrieverInput<T, K | readonly K[]>
): Record<K, T[]> {
  const get = valueRetriever<T, K | readonly K[]>(by)
  const out = {} as Record<K, T[]>
  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const keyVal = get(item, i)
    const keys = Array.isArray(keyVal) ? (keyVal as readonly K[]) : [keyVal as K]
    for (const k of keys) {
      if (out[k] === undefined) out[k] = []
      out[k].push(item)
    }
  }
  return out
}

/** groupByMany: apply multiple grouping functions left-to-right, producing nested groups. */
export function groupByManyOf<T>(
  items: readonly T[],
  groupers: readonly RetrieverInput<T>[]
): Record<PropertyKey, unknown> {
  if (groupers.length === 0) return items as unknown as Record<PropertyKey, unknown>
  const [first, ...rest] = groupers
  const top = groupByOf(items, first as RetrieverInput<T, PropertyKey>)
  if (rest.length === 0) return top
  const out: Record<PropertyKey, unknown> = {}
  for (const key of Object.keys(top)) {
    out[key] = groupByManyOf(top[key as keyof typeof top] as T[], rest)
  }
  return out
}

export function keyByOf<T, K extends PropertyKey = PropertyKey>(
  items: readonly T[],
  by: RetrieverInput<T, K>
): Record<K, T> {
  const get = valueRetriever<T, K>(by)
  const out = {} as Record<K, T>
  for (let i = 0; i < items.length; i++) out[get(items[i], i)] = items[i]
  return out
}
