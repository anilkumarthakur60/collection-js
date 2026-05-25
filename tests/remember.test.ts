import { collect, LazyCollection } from '../src'

describe('remember', () => {
  it('returns the same items on first enumeration', () => {
    const result = collect([1, 2, 3]).lazy().remember().all()
    expect(result).toEqual([1, 2, 3])
  })

  it('returns a LazyCollection', () => {
    const result = collect([1, 2]).lazy().remember()
    expect(result).toBeInstanceOf(LazyCollection)
  })

  it('does not re-evaluate the source on a second full iteration', () => {
    let evaluations = 0
    const source = [1, 2, 3]
    const lazy = new LazyCollection<number>(function* () {
      for (const n of source) {
        evaluations++
        yield n
      }
    }).remember()

    const first = lazy.all()
    const second = lazy.all()

    expect(first).toEqual([1, 2, 3])
    expect(second).toEqual([1, 2, 3])
    // Source generator runs exactly once; second full iteration uses the cache
    expect(evaluations).toBe(3)
  })

  it('works on an empty collection', () => {
    const result = collect<number>([]).lazy().remember().all()
    expect(result).toEqual([])
  })

  it('is chainable with other lazy methods', () => {
    const result = collect([1, 2, 3, 4])
      .lazy()
      .remember()
      .filter((v) => v % 2 === 0)
      .all()
    expect(result).toEqual([2, 4])
  })

  it('partial first pass then full second pass only evaluates source once total', () => {
    let evaluations = 0
    const lazy = new LazyCollection<number>(function* () {
      for (const n of [1, 2, 3, 4, 5]) {
        evaluations++
        yield n
      }
    }).remember()

    // First pass: take 2 — caches [1, 2], source evaluated 2 times
    const partial = lazy.take(2).all()
    expect(partial).toEqual([1, 2])
    expect(evaluations).toBe(2)

    // Second pass: all() — yields [1, 2] from cache, pulls [3,4,5] from source
    const full = lazy.all()
    expect(full).toEqual([1, 2, 3, 4, 5])
    expect(evaluations).toBe(5)

    // Third pass: all() — fully cached, source not touched
    const cached = lazy.all()
    expect(cached).toEqual([1, 2, 3, 4, 5])
    expect(evaluations).toBe(5)
  })
})
