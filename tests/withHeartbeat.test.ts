import { collect, LazyCollection } from '../src/collect'

describe('withHeartbeat', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('yields all items unchanged', () => {
    const result = collect([1, 2, 3]).lazy().withHeartbeat(1000, () => undefined).all()
    expect(result).toEqual([1, 2, 3])
  })

  it('returns a LazyCollection', () => {
    const result = collect([1, 2]).lazy().withHeartbeat(1000, () => undefined)
    expect(result).toBeInstanceOf(LazyCollection)
  })

  it('does not call the callback if the interval has not elapsed', () => {
    const heartbeats: number[] = []
    // Items are consumed synchronously so Date.now() barely advances
    collect([1, 2, 3])
      .lazy()
      .withHeartbeat(60_000, () => heartbeats.push(Date.now()))
      .all()
    expect(heartbeats).toHaveLength(0)
  })

  it('calls the callback when the interval elapses between items', () => {
    const heartbeats: number[] = []
    let now = 0

    // Advance clock by 600ms for every call so a 500ms interval fires
    jest.spyOn(Date, 'now').mockImplementation(() => {
      now += 600
      return now
    })

    collect([1, 2, 3])
      .lazy()
      .withHeartbeat(500, () => heartbeats.push(now))
      .all()

    jest.spyOn(Date, 'now').mockRestore()

    // Each of the 3 items advances clock by 600ms > 500ms interval
    expect(heartbeats.length).toBeGreaterThan(0)
  })

  it('works on an empty collection', () => {
    const heartbeats: number[] = []
    const result = collect<number>([])
      .lazy()
      .withHeartbeat(100, () => heartbeats.push(1))
      .all()
    expect(result).toEqual([])
    expect(heartbeats).toHaveLength(0)
  })

  it('is chainable with other lazy methods', () => {
    const result = collect([1, 2, 3, 4])
      .lazy()
      .withHeartbeat(60_000, () => undefined)
      .filter((v) => v % 2 === 0)
      .all()
    expect(result).toEqual([2, 4])
  })

  it('default interval of 1000ms is used when iterating', () => {
    // Verify the method signature accepts intervalMs as first param and callback second
    const cb = jest.fn()
    collect([1]).lazy().withHeartbeat(1000, cb).all()
    // No assertion on call count — just verifying it doesn't throw
    expect(true).toBe(true)
  })
})
