import { collect } from '../src'

async function drain<T>(source: AsyncIterable<T>): Promise<T[]> {
  const out: T[] = []
  for await (const item of source) out.push(item)
  return out
}

describe('throttle', () => {
  it('returns an AsyncIterable that yields all items in order', async () => {
    const out = await drain(collect([1, 2, 3]).lazy().throttle(0))
    expect(out).toEqual([1, 2, 3])
  })

  it('preserves item order', async () => {
    const out = await drain(collect(['a', 'b', 'c']).lazy().throttle(0))
    expect(out).toEqual(['a', 'b', 'c'])
  })

  it('works on an empty collection', async () => {
    const out = await drain(collect<number>([]).lazy().throttle(0))
    expect(out).toEqual([])
  })

  it('paces output by the given seconds (smoke test)', async () => {
    const start = Date.now()
    await drain(collect([1, 2, 3]).lazy().throttle(0.02))
    const elapsed = Date.now() - start
    // 3 items, 2 throttled gaps × 20ms ≥ 30ms (allow scheduling jitter)
    expect(elapsed).toBeGreaterThanOrEqual(30)
  })
})
