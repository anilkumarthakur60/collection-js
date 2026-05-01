export function combineOf<K extends PropertyKey, V>(
  keys: readonly K[],
  values: readonly V[]
): Record<K, V> {
  const out = {} as Record<K, V>
  const len = Math.min(keys.length, values.length)
  for (let i = 0; i < len; i++) out[keys[i]] = values[i]
  return out
}

export function zipOf<T, U>(items: readonly T[], values: readonly U[]): [T, U | undefined][] {
  const out: [T, U | undefined][] = []
  for (let i = 0; i < items.length; i++) out.push([items[i], values[i]])
  return out
}

/** Multi-source zip producing tuples of length N. Stops at the shortest input. */
export function zipManyOf<T>(...sources: readonly (readonly T[])[]): T[][] {
  if (sources.length === 0) return []
  const len = Math.min(...sources.map((s) => s.length))
  const out: T[][] = []
  for (let i = 0; i < len; i++) out.push(sources.map((s) => s[i]))
  return out
}
