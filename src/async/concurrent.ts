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
  let nextIndex = 0
  let firstError: unknown = undefined
  let exhausted = false

  const startNext = async (): Promise<void> => {
    if (exhausted || firstError !== undefined) return
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
        if (firstError === undefined) firstError = err
      })
    const wrapped = task.finally(() => {
      inflight.delete(wrapped)
    })
    inflight.add(wrapped)
  }

  // Prime the pool, then keep replenishing as slots free up.
  while (inflight.size < concurrency && !exhausted && firstError === undefined) {
    await startNext()
  }
  while (inflight.size > 0) {
    await Promise.race(inflight)
    if (firstError !== undefined) break
    while (inflight.size < concurrency && !exhausted) await startNext()
  }
  await Promise.allSettled(inflight)
  if (firstError !== undefined) throw firstError
  return results
}

function isAsyncIterable<T>(value: unknown): value is AsyncIterable<T> {
  return value !== null && typeof value === 'object' && Symbol.asyncIterator in (value as object)
}

async function* toAsyncIterator<T>(source: Iterable<T>): AsyncGenerator<T> {
  for (const item of source) yield item
}
