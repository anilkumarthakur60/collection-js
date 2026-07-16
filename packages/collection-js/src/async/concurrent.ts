/**
 * Run `fn` against each item with bounded parallelism. Results are returned
 * in source order regardless of completion order. If any task rejects, the
 * remaining in-flight tasks are awaited and the first rejection is rethrown.
 */
export async function mapWithConcurrency<T, R>(
  source: AsyncIterable<T> | Iterable<T>,
  concurrency: number,
  fn: (item: T, index: number) => Promise<R> | R
): Promise<R[]> {
  if (concurrency <= 0 || !Number.isFinite(concurrency)) {
    throw new RangeError(`concurrency must be a positive finite number (got ${concurrency})`)
  }
  const iterator = isAsyncIterable(source)
    ? source[Symbol.asyncIterator]()
    : toAsyncIterator(source)
  const results: R[] = []
  const inflight = new Set<Promise<void>>()
  // First-settled rejection reasons land at index 0. An array (rather than an
  // `unknown` sentinel compared against `undefined`) keeps a task that rejects
  // WITH `undefined` as its reason counting as a failure.
  const errors: unknown[] = []
  let nextIndex = 0
  let exhausted = false

  const startNext = async (): Promise<void> => {
    if (exhausted || errors.length > 0) return
    const next = await iterator.next()
    if (next.done) {
      exhausted = true
      return
    }
    const i = nextIndex++
    const task = Promise.resolve(fn(next.value, i))
      .then((value) => {
        results[i] = value
      })
      .catch((err: unknown) => {
        errors.push(err)
      })
    const wrapped = task.finally(() => {
      inflight.delete(wrapped)
    })
    inflight.add(wrapped)
  }

  // Prime the pool, then keep replenishing as slots free up.
  while (inflight.size < concurrency && !exhausted && errors.length === 0) {
    await startNext()
  }
  while (inflight.size > 0) {
    await Promise.race(inflight)
    if (errors.length > 0) break
    while (inflight.size < concurrency && !exhausted) await startNext()
  }
  await Promise.allSettled(inflight)
  if (errors.length > 0) throw errors[0]
  return results
}

function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  return value !== null && typeof value === 'object' && Symbol.asyncIterator in value
}

async function* toAsyncIterator<T>(source: Iterable<T>): AsyncGenerator<T> {
  for (const item of source) yield await Promise.resolve(item)
}
