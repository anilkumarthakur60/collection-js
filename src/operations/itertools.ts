/**
 * Reduce that emits intermediate accumulator states. Useful for cumulative
 * sums, state machines, and deriving "running" series.
 */
export function scanOf<T, R>(
  items: readonly T[],
  fn: (carry: R, item: T, index: number) => R,
  initial: R,
): R[] {
  const out: R[] = []
  let acc = initial
  for (let i = 0; i < items.length; i++) {
    acc = fn(acc, items[i], i)
    out.push(acc)
  }
  return out
}

/** Yield consecutive pairs: `[a, b, c, d]` → `[[a,b],[b,c],[c,d]]`. */
export function pairwiseOf<T>(items: readonly T[]): [T, T][] {
  if (items.length < 2) return []
  const out: [T, T][] = []
  for (let i = 0; i < items.length - 1; i++) out.push([items[i], items[i + 1]])
  return out
}

/** Tag each item with its index: `[a, b]` → `[[0,a],[1,b]]`. */
export function enumerateOf<T>(items: readonly T[], start: number = 0): [number, T][] {
  return items.map((item, i) => [start + i, item])
}

/**
 * Repeat the input `n` times. If `n` is `Infinity`, returns a generator that
 * never terminates — caller must `.take()` to bound it.
 */
export function* cycleOf<T>(items: readonly T[], n: number = Infinity): Generator<T> {
  if (items.length === 0) return
  for (let i = 0; i < n; i++) for (const item of items) yield item
}

/**
 * Round-robin interleave of multiple sources: zips the heads, then the
 * second-positions, etc. Stops at the shortest source.
 */
export function interleaveOf<T>(...sources: readonly (readonly T[])[]): T[] {
  if (sources.length === 0) return []
  const len = Math.min(...sources.map((s) => s.length))
  const out: T[] = []
  for (let i = 0; i < len; i++) for (const src of sources) out.push(src[i])
  return out
}

/**
 * Split a single iterable into `n` independent iterables that can each be
 * consumed independently. The shared underlying iterator is buffered as
 * needed — memory grows with the gap between fastest and slowest consumer.
 */
export function teeOf<T>(source: Iterable<T>, n: number): Generator<T>[] {
  const it = source[Symbol.iterator]()
  const queues: T[][] = Array.from({ length: n }, () => [])
  let exhausted = false

  function* consumer(idx: number): Generator<T> {
    while (true) {
      if (queues[idx].length > 0) {
        yield queues[idx].shift() as T
        continue
      }
      if (exhausted) return
      const next = it.next()
      if (next.done) {
        exhausted = true
        return
      }
      for (let i = 0; i < n; i++) {
        if (i === idx) continue
        queues[i].push(next.value)
      }
      yield next.value
    }
  }

  return queues.map((_, i) => consumer(i))
}

/**
 * All r-length permutations (without repetition). For an n-element input
 * with r = n this generates n! sequences. Order matches Python's itertools.
 */
export function* permutationsOf<T>(items: readonly T[], r?: number): Generator<T[]> {
  const n = items.length
  const k = r === undefined ? n : r
  if (k > n) return
  const indices: number[] = Array.from({ length: n }, (_, i) => i)
  const cycles: number[] = Array.from({ length: k }, (_, i) => n - i)
  yield indices.slice(0, k).map((i) => items[i])
  while (n > 0) {
    let done = true
    for (let i = k - 1; i >= 0; i--) {
      cycles[i] -= 1
      if (cycles[i] === 0) {
        const removed = indices.splice(i, 1)[0]
        indices.push(removed)
        cycles[i] = n - i
      } else {
        const j = cycles[i]
        ;[indices[i], indices[indices.length - j]] = [indices[indices.length - j], indices[i]]
        yield indices.slice(0, k).map((idx) => items[idx])
        done = false
        break
      }
    }
    if (done) return
  }
}

/**
 * All r-length combinations (without repetition). For r = n this yields a
 * single combination — the input itself.
 */
export function* combinationsOf<T>(items: readonly T[], r: number): Generator<T[]> {
  const n = items.length
  if (r > n || r < 0) return
  const indices: number[] = Array.from({ length: r }, (_, i) => i)
  yield indices.map((i) => items[i])
  while (true) {
    let i = r - 1
    while (i >= 0 && indices[i] === i + n - r) i--
    if (i < 0) return
    indices[i] += 1
    for (let j = i + 1; j < r; j++) indices[j] = indices[j - 1] + 1
    yield indices.map((idx) => items[idx])
  }
}

/** Power set — all 2^n subsets, in increasing-size order. */
export function* powerSetOf<T>(items: readonly T[]): Generator<T[]> {
  for (let r = 0; r <= items.length; r++) yield* combinationsOf(items, r)
}
