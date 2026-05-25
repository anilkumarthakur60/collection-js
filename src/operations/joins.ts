import { valueRetriever, type RetrieverInput } from '../support/valueRetriever'

export type JoinResult<L, R, M> = M extends (left: L, right: R) => infer U ? U : [L, R]

function bucketByKey<T, K extends PropertyKey>(
  items: readonly T[],
  by: RetrieverInput<T, K>
): Map<K, T[]> {
  const get = valueRetriever<T, K>(by)
  const out = new Map<K, T[]>()
  for (let i = 0; i < items.length; i++) {
    const k = get(items[i], i)
    const arr = out.get(k)
    if (arr) arr.push(items[i])
    else out.set(k, [items[i]])
  }
  return out
}

/**
 * Inner join: emit one row per matching pair on `leftKey` / `rightKey`. If a
 * `merge` function is supplied its return value is emitted; otherwise tuples
 * `[left, right]` are produced.
 */
export function joinOnOf<L, R, K extends PropertyKey, M = [L, R]>(
  left: readonly L[],
  right: readonly R[],
  leftKey: RetrieverInput<L, K>,
  rightKey: RetrieverInput<R, K>,
  merge?: (l: L, r: R) => M
): M[] {
  const buckets = bucketByKey(right, rightKey)
  const getL = valueRetriever<L, K>(leftKey)
  const out: M[] = []
  for (let i = 0; i < left.length; i++) {
    const k = getL(left[i], i)
    const matches = buckets.get(k)
    if (!matches) continue
    for (const r of matches) {
      out.push(merge ? merge(left[i], r) : ([left[i], r] as unknown as M))
    }
  }
  return out
}

/**
 * Left join: each left row appears at least once. When no right match exists,
 * `right` is `undefined` (or supplied to `merge` as undefined).
 */
export function leftJoinOf<L, R, K extends PropertyKey, M = [L, R | undefined]>(
  left: readonly L[],
  right: readonly R[],
  leftKey: RetrieverInput<L, K>,
  rightKey: RetrieverInput<R, K>,
  merge?: (l: L, r: R | undefined) => M
): M[] {
  const buckets = bucketByKey(right, rightKey)
  const getL = valueRetriever<L, K>(leftKey)
  const out: M[] = []
  for (let i = 0; i < left.length; i++) {
    const k = getL(left[i], i)
    const matches = buckets.get(k)
    if (matches && matches.length > 0) {
      for (const r of matches) out.push(merge ? merge(left[i], r) : ([left[i], r] as unknown as M))
    } else {
      out.push(merge ? merge(left[i], undefined) : ([left[i], undefined] as unknown as M))
    }
  }
  return out
}

/** Right join — symmetrical to leftJoin. */
export function rightJoinOf<L, R, K extends PropertyKey, M = [L | undefined, R]>(
  left: readonly L[],
  right: readonly R[],
  leftKey: RetrieverInput<L, K>,
  rightKey: RetrieverInput<R, K>,
  merge?: (l: L | undefined, r: R) => M
): M[] {
  const buckets = bucketByKey(left, leftKey)
  const getR = valueRetriever<R, K>(rightKey)
  const out: M[] = []
  for (let i = 0; i < right.length; i++) {
    const k = getR(right[i], i)
    const matches = buckets.get(k)
    if (matches && matches.length > 0) {
      for (const l of matches)
        out.push(merge ? merge(l, right[i]) : ([l, right[i]] as unknown as M))
    } else {
      out.push(merge ? merge(undefined, right[i]) : ([undefined, right[i]] as unknown as M))
    }
  }
  return out
}

/** Full outer join — every left and right row appears at least once. */
export function outerJoinOf<L, R, K extends PropertyKey, M = [L | undefined, R | undefined]>(
  left: readonly L[],
  right: readonly R[],
  leftKey: RetrieverInput<L, K>,
  rightKey: RetrieverInput<R, K>,
  merge?: (l: L | undefined, r: R | undefined) => M
): M[] {
  const rightBuckets = bucketByKey(right, rightKey)
  const getL = valueRetriever<L, K>(leftKey)
  const consumedRightKeys = new Set<K>()
  const out: M[] = []

  for (let i = 0; i < left.length; i++) {
    const k = getL(left[i], i)
    const matches = rightBuckets.get(k)
    if (matches && matches.length > 0) {
      consumedRightKeys.add(k)
      for (const r of matches) out.push(merge ? merge(left[i], r) : ([left[i], r] as unknown as M))
    } else {
      out.push(merge ? merge(left[i], undefined) : ([left[i], undefined] as unknown as M))
    }
  }

  for (const [k, rows] of rightBuckets) {
    if (consumedRightKeys.has(k)) continue
    for (const r of rows) out.push(merge ? merge(undefined, r) : ([undefined, r] as unknown as M))
  }
  return out
}
