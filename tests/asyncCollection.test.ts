import { AsyncCollection, mapWithConcurrency } from '../src'

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
        { concurrency: 4 },
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

  it('flatMap supports sync and async iterables', async () => {
    const out = await AsyncCollection.from([1, 2, 3]).flatMap((n) => [n, n * 10]).toArray()
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
      }),
    ).rejects.toThrow('boom')
  })

  it('rejects non-positive concurrency', async () => {
    await expect(mapWithConcurrency([1], 0, async (n) => n)).rejects.toThrow(RangeError)
  })
})
