import { collect, LazyCollection } from '../collect'

describe('takeUntilTimeout', () => {
  it('returns all items when timeout is far in the future', () => {
    const future = new Date(Date.now() + 60_000)
    const result = collect([1, 2, 3]).lazy().takeUntilTimeout(future).all()
    expect(result).toEqual([1, 2, 3])
  })

  it('returns no items when timeout has already passed', () => {
    const past = new Date(Date.now() - 1_000)
    const result = collect([1, 2, 3]).lazy().takeUntilTimeout(past).all()
    expect(result).toEqual([])
  })

  it('returns a LazyCollection', () => {
    const future = new Date(Date.now() + 60_000)
    const result = collect([1, 2]).lazy().takeUntilTimeout(future)
    expect(result).toBeInstanceOf(LazyCollection)
  })

  it('is chainable with other lazy methods', () => {
    const future = new Date(Date.now() + 60_000)
    const result = collect([1, 2, 3, 4])
      .lazy()
      .takeUntilTimeout(future)
      .filter((v) => v % 2 === 0)
      .all()
    expect(result).toEqual([2, 4])
  })

  it('works on an empty collection', () => {
    const future = new Date(Date.now() + 60_000)
    const result = collect<number>([]).lazy().takeUntilTimeout(future).all()
    expect(result).toEqual([])
  })

  it('can be chained after take to limit both by count and time', () => {
    const future = new Date(Date.now() + 60_000)
    const result = collect([1, 2, 3, 4, 5]).lazy().takeUntilTimeout(future).take(3).all()
    expect(result).toEqual([1, 2, 3])
  })
})
