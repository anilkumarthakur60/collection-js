import { deepEqual, looseEqual } from '../support/deepEqual'
import { valueRetriever, type RetrieverInput } from '../support/valueRetriever'

export function uniqueOf<T>(items: readonly T[], by?: RetrieverInput<T>, strict = false): T[] {
  const get = by !== undefined ? valueRetriever<T, unknown>(by) : (item: T) => item as unknown
  const seen: unknown[] = []
  const out: T[] = []
  for (let i = 0; i < items.length; i++) {
    const key = get(items[i], i)
    const found = strict
      ? seen.some((s) => s === key || deepEqual(s, key))
      : seen.some((s) => looseEqual(s, key))
    if (!found) {
      seen.push(key)
      out.push(items[i])
    }
  }
  return out
}

export function uniqueStrictOf<T>(items: readonly T[], by?: RetrieverInput<T>): T[] {
  return uniqueOf(items, by, true)
}
