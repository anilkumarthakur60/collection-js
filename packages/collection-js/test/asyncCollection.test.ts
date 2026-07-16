import { AsyncCollection, mapWithConcurrency } from '../src'

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

describe('AsyncCollection', () => {
  it('range produces a sync-friendly numeric range', async () => {
    expect(await AsyncCollection.range(1, 5).toArray()).toEqual([1, 2, 3, 4, 5])
  })

  it('map / filter / take chain', async () => {
    const out = await AsyncCollection.range(1, 10)
      .filter((n) => n % 2 === 0)
      .map((n) => n * 100)
      .take(3)
      .toArray()
    expect(out).toEqual([200, 400, 600])
  })

  it('count consumes the source exactly once per call', async () => {
    let pulls = 0
    const ac = AsyncCollection.from(async function* () {
      for (let i = 0; i < 5; i++) {
        pulls++
        yield i
      }
    })
    expect(await ac.count()).toBe(5)
    expect(pulls).toBe(5)
  })

  it('first/last respect predicates', async () => {
    expect(await AsyncCollection.range(1, 10).first((n) => n > 7)).toBe(8)
    expect(await AsyncCollection.range(1, 10).last((n) => n < 4)).toBe(3)
  })

  it('every / some', async () => {
    expect(await AsyncCollection.range(1, 5).every((n) => n > 0)).toBe(true)
    expect(await AsyncCollection.range(1, 5).every((n) => n > 3)).toBe(false)
    expect(await AsyncCollection.range(1, 5).some((n) => n > 3)).toBe(true)
  })

  it('reduce sums an async source', async () => {
    expect(await AsyncCollection.range(1, 5).reduce((a, b) => a + b, 0)).toBe(15)
  })

  it('mapAsync runs with bounded concurrency, output stays in order', async () => {
    const start = Date.now()
    const out = await AsyncCollection.range(1, 8)
      .mapAsync(
        async (n) => {
          await new Promise((r) => setTimeout(r, 30))
          return n * 10
        },
        { concurrency: 4 }
      )
      .toArray()
    expect(out).toEqual([10, 20, 30, 40, 50, 60, 70, 80])
    const elapsed = Date.now() - start
    // 8 items / 4 concurrency × 30ms = ~60ms (allow scheduling jitter)
    expect(elapsed).toBeLessThan(180)
  })

  it('chunk batches values', async () => {
    const out = await AsyncCollection.range(1, 7).chunk(3).toArray()
    expect(out).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('chunk emits no trailing partial batch when the size divides evenly', async () => {
    const out = await AsyncCollection.range(1, 6).chunk(3).toArray()
    expect(out).toEqual([
      [1, 2, 3],
      [4, 5, 6]
    ])
  })

  it('flatMap supports sync and async iterables', async () => {
    const out = await AsyncCollection.from([1, 2, 3])
      .flatMap((n) => [n, n * 10])
      .toArray()
    expect(out).toEqual([1, 10, 2, 20, 3, 30])
  })

  it('filterAsync with concurrency', async () => {
    const out = await AsyncCollection.range(1, 6)
      .filterAsync(async (n) => n % 2 === 0, { concurrency: 2 })
      .toArray()
    expect(out).toEqual([2, 4, 6])
  })

  it('collect() bridges back to a sync Collection', async () => {
    const c = await AsyncCollection.range(1, 3).collect()
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('fromAsyncIterable wraps an existing async iterable', async () => {
    const gen = (async function* () {
      yield 'a'
      yield 'b'
    })()
    expect(await AsyncCollection.fromAsyncIterable(gen).toArray()).toEqual(['a', 'b'])
  })

  it('empty() yields nothing', async () => {
    expect(await AsyncCollection.empty<number>().toArray()).toEqual([])
    expect(await AsyncCollection.empty<number>().count()).toBe(0)
  })

  it('range supports descending steps and rejects a zero step', async () => {
    expect(await AsyncCollection.range(5, 1, -2).toArray()).toEqual([5, 3, 1])
    expect(() => AsyncCollection.range(1, 5, 0)).toThrow(RangeError)
  })

  it('toJson serialises the materialised items', async () => {
    expect(await AsyncCollection.from([1, 2, 3]).toJson()).toBe('[1,2,3]')
  })

  it('first/last return undefined when nothing matches', async () => {
    expect(await AsyncCollection.empty<number>().first()).toBeUndefined()
    expect(await AsyncCollection.range(1, 5).first((n) => n > 99)).toBeUndefined()
    expect(await AsyncCollection.range(1, 5).last((n) => n > 99)).toBeUndefined()
  })

  it('some returns false when no item matches; every is true on empty', async () => {
    expect(await AsyncCollection.range(1, 5).some((n) => n > 99)).toBe(false)
    expect(await AsyncCollection.empty<number>().every(() => false)).toBe(true)
  })

  it('forEach runs sequentially and passes indices', async () => {
    const seen: Array<[string, number]> = []
    await AsyncCollection.from(['a', 'b', 'c']).forEach(async (item, i) => {
      await sleep(1)
      seen.push([item, i])
    })
    expect(seen).toEqual([
      ['a', 0],
      ['b', 1],
      ['c', 2]
    ])
  })

  it('eachAsync visits every item with bounded concurrency', async () => {
    let inFlight = 0
    let maxInFlight = 0
    const seen: number[] = []
    await AsyncCollection.range(1, 8).eachAsync(
      async (n) => {
        inFlight++
        maxInFlight = Math.max(maxInFlight, inFlight)
        await sleep(10)
        seen.push(n)
        inFlight--
      },
      { concurrency: 4 }
    )
    expect([...seen].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
    expect(maxInFlight).toBeGreaterThan(1)
    expect(maxInFlight).toBeLessThanOrEqual(4)
  })

  it('eachAsync rethrows the first callback error', async () => {
    await expect(
      AsyncCollection.range(1, 5).eachAsync(
        async (n) => {
          if (n === 3) throw new Error('each-boom')
        },
        { concurrency: 2 }
      )
    ).rejects.toThrow('each-boom')
  })

  it('skip drops the first N items', async () => {
    expect(await AsyncCollection.range(1, 5).skip(2).toArray()).toEqual([3, 4, 5])
    expect(await AsyncCollection.range(1, 3).skip(0).toArray()).toEqual([1, 2, 3])
    expect(await AsyncCollection.range(1, 3).skip(99).toArray()).toEqual([])
  })

  it('takeWhile stops at the first failing predicate', async () => {
    expect(
      await AsyncCollection.from([1, 2, 3, 1, 2])
        .takeWhile((n) => n < 3)
        .toArray()
    ).toEqual([1, 2])
    expect(
      await AsyncCollection.range(1, 3)
        .takeWhile(async (n) => n < 99)
        .toArray()
    ).toEqual([1, 2, 3])
  })

  it('skipWhile skips the leading run only', async () => {
    expect(
      await AsyncCollection.from([1, 2, 3, 1, 2])
        .skipWhile((n) => n < 3)
        .toArray()
    ).toEqual([3, 1, 2])
    expect(
      await AsyncCollection.range(1, 3)
        .skipWhile(() => true)
        .toArray()
    ).toEqual([])
  })

  it('tap observes items (with indices) without altering the stream', async () => {
    const seen: Array<[number, number]> = []
    const out = await AsyncCollection.from([10, 20])
      .tap(async (item, i) => {
        seen.push([item, i])
      })
      .toArray()
    expect(out).toEqual([10, 20])
    expect(seen).toEqual([
      [10, 0],
      [20, 1]
    ])
  })

  it('flatMap flattens async iterables and promised sync iterables', async () => {
    const fromAsync = await AsyncCollection.from([1, 2])
      .flatMap((n) =>
        (async function* () {
          yield n
          yield n * 10
        })()
      )
      .toArray()
    expect(fromAsync).toEqual([1, 10, 2, 20])

    const fromPromise = await AsyncCollection.from([1, 2])
      .flatMap((n) => Promise.resolve([n, -n]))
      .toArray()
    expect(fromPromise).toEqual([1, -1, 2, -2])
  })

  it('chunk rejects a non-positive size', () => {
    expect(() => AsyncCollection.range(1, 3).chunk(0)).toThrow(RangeError)
  })
})

describe('AsyncCollection.mapAsync concurrency semantics', () => {
  it('emits in source order even when item 0 completes last', async () => {
    const delays = [80, 10, 30, 5, 20, 15]
    const completed: number[] = []
    const out = await AsyncCollection.from([0, 1, 2, 3, 4, 5])
      .mapAsync(
        async (n) => {
          await sleep(delays[n])
          completed.push(n)
          return n * 10
        },
        { concurrency: 6 }
      )
      .toArray()
    expect(out).toEqual([0, 10, 20, 30, 40, 50])
    // Completion genuinely happened out of order, with the head finishing last.
    expect(completed[0]).not.toBe(0)
    expect(completed[completed.length - 1]).toBe(0)
  })

  it('never runs more than `concurrency` callbacks at once', async () => {
    let inFlight = 0
    let maxInFlight = 0
    await AsyncCollection.range(1, 10)
      .mapAsync(
        async (n) => {
          inFlight++
          maxInFlight = Math.max(maxInFlight, inFlight)
          await sleep(10)
          inFlight--
          return n
        },
        { concurrency: 3 }
      )
      .toArray()
    expect(maxInFlight).toBeGreaterThan(1)
    expect(maxInFlight).toBeLessThanOrEqual(3)
  })

  it('concurrency 1 behaves sequentially', async () => {
    const order: number[] = []
    const out = await AsyncCollection.from([3, 1, 2])
      .mapAsync(
        async (n) => {
          order.push(n)
          await sleep(n)
          return n
        },
        { concurrency: 1 }
      )
      .toArray()
    expect(out).toEqual([3, 1, 2])
    expect(order).toEqual([3, 1, 2])
  })

  it('handles an empty source', async () => {
    expect(
      await AsyncCollection.empty<number>()
        .mapAsync(async (n) => n)
        .toArray()
    ).toEqual([])
  })

  it('rejects non-positive or non-finite concurrency at call time', () => {
    const c = AsyncCollection.from([1])
    expect(() => c.mapAsync(async (n) => n, { concurrency: 0 })).toThrow(RangeError)
    expect(() => c.mapAsync(async (n) => n, { concurrency: -2 })).toThrow(RangeError)
    expect(() => c.mapAsync(async (n) => n, { concurrency: Infinity })).toThrow(RangeError)
  })
})

// Audit fix: "AsyncCollection.mapAsync leaks unhandled promise rejections".
// A non-head task that rejected while the head task was still in flight used
// to sit unobserved and fire a process-level unhandledRejection (crashing
// under Node's default policy). Tasks are now stored as never-rejecting
// outcome promises and drained via Promise.allSettled before the error is
// rethrown, mirroring mapWithConcurrency.
describe('regression: mapAsync leaked unhandled promise rejections', () => {
  it('surfaces the error to the consumer with zero unhandledRejection events', async () => {
    const unhandled: unknown[] = []
    const listener = (reason: unknown) => {
      unhandled.push(reason)
    }
    process.on('unhandledRejection', listener)
    try {
      const delays = [100, 5, 10]
      const stream = AsyncCollection.from([0, 1, 2]).mapAsync(
        async (n) => {
          await sleep(delays[n])
          if (n === 1) throw new Error(`boom-${n}`)
          return n
        },
        { concurrency: 3 }
      )
      await expect(stream.toArray()).rejects.toThrow('boom-1')
      // unhandledRejection events fire on later macrotask ticks — give the
      // event loop time to flush any before asserting none arrived.
      await sleep(50)
      expect(unhandled).toEqual([])
    } finally {
      process.removeListener('unhandledRejection', listener)
    }
  })

  it('waits for in-flight tasks before rethrowing (allSettled drain)', async () => {
    let slowFinished = false
    const stream = AsyncCollection.from([0, 1]).mapAsync(
      async (n) => {
        if (n === 0) throw new Error('fail-fast')
        await sleep(40)
        slowFinished = true
        return n
      },
      { concurrency: 2 }
    )
    await expect(stream.toArray()).rejects.toThrow('fail-fast')
    expect(slowFinished).toBe(true)
  })

  it('propagates a synchronously-thrown callback error', async () => {
    const stream = AsyncCollection.from([1]).mapAsync(() => {
      throw new Error('sync-boom')
    })
    await expect(stream.toArray()).rejects.toThrow('sync-boom')
  })

  it('yields items preceding the failure in order before rejecting', async () => {
    const seen: number[] = []
    let caught: unknown
    try {
      const stream = AsyncCollection.from([0, 1, 2, 3]).mapAsync(
        async (n) => {
          if (n === 2) throw new Error('boom-2')
          return n * 10
        },
        { concurrency: 2 }
      )
      for await (const v of stream) seen.push(v)
    } catch (e) {
      caught = e
    }
    expect(seen).toEqual([0, 10])
    expect((caught as Error).message).toBe('boom-2')
  })

  it('filterAsync (built on mapAsync) propagates predicate errors cleanly', async () => {
    const unhandled: unknown[] = []
    const listener = (reason: unknown) => {
      unhandled.push(reason)
    }
    process.on('unhandledRejection', listener)
    try {
      const stream = AsyncCollection.from([0, 1, 2]).filterAsync(
        async (n) => {
          await sleep(n === 0 ? 60 : 5)
          if (n === 1) throw new Error('pred-boom')
          return true
        },
        { concurrency: 3 }
      )
      await expect(stream.toArray()).rejects.toThrow('pred-boom')
      await sleep(50)
      expect(unhandled).toEqual([])
    } finally {
      process.removeListener('unhandledRejection', listener)
    }
  })
})

describe('mapWithConcurrency (helper)', () => {
  it('runs tasks in parallel with the configured limit', async () => {
    const result = await mapWithConcurrency([1, 2, 3, 4], 2, async (n) => n * 2)
    expect(result).toEqual([2, 4, 6, 8])
  })

  it('rethrows the first error and waits for in-flight tasks', async () => {
    await expect(
      mapWithConcurrency([1, 2, 3], 2, async (n) => {
        if (n === 2) throw new Error('boom')
        return n
      })
    ).rejects.toThrow('boom')
  })

  it('rejects non-positive concurrency', async () => {
    await expect(mapWithConcurrency([1], 0, async (n) => n)).rejects.toThrow(RangeError)
  })

  it('replenishes the pool as slots free up and keeps source order', async () => {
    const delays = [30, 5, 25, 5, 20, 5, 15, 5, 10, 5]
    let inFlight = 0
    let maxInFlight = 0
    const result = await mapWithConcurrency([...delays.keys()], 2, async (i) => {
      inFlight++
      maxInFlight = Math.max(maxInFlight, inFlight)
      await sleep(delays[i])
      inFlight--
      return i * 2
    })
    expect(result).toEqual([0, 2, 4, 6, 8, 10, 12, 14, 16, 18])
    expect(maxInFlight).toBe(2)
  })

  it('accepts an async iterable source', async () => {
    const source = (async function* () {
      yield 1
      yield 2
      yield 3
    })()
    expect(await mapWithConcurrency(source, 2, (n) => n + 1)).toEqual([2, 3, 4])
  })

  it('lets in-flight tasks settle before rejecting', async () => {
    let slowFinished = false
    await expect(
      mapWithConcurrency([1, 2], 2, async (n) => {
        if (n === 1) throw new Error('boom')
        await sleep(30)
        slowFinished = true
        return n
      })
    ).rejects.toThrow('boom')
    expect(slowFinished).toBe(true)
  })

  it('returns [] for an empty source', async () => {
    expect(await mapWithConcurrency([], 4, async (n: number) => n)).toEqual([])
  })
})

describe('AsyncCollection.eachAsync default concurrency', () => {
  it('runs sequentially when no options are given', async () => {
    const seen: number[] = []
    await AsyncCollection.from([1, 2, 3]).eachAsync(async (n) => {
      await sleep(1)
      seen.push(n)
    })
    expect(seen).toEqual([1, 2, 3])
  })
})

describe('AsyncCollection.take guard (audit: count <= 0 branch untested)', () => {
  it('take(0) and take(-1) yield nothing without touching the source', async () => {
    let pulled = 0
    const src = AsyncCollection.from(async function* () {
      pulled++
      yield 1
    })
    expect(await src.take(0).toArray()).toEqual([])
    expect(await AsyncCollection.from([1, 2]).take(-1).toArray()).toEqual([])
    expect(pulled).toBe(0)
  })
})
