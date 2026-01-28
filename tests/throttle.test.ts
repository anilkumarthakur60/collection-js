import { collect, LazyCollection } from '../src'

describe('throttle', () => {
  it('returns all items unchanged', () => {
    const result = collect([1, 2, 3]).lazy().throttle(1).all()
    expect(result).toEqual([1, 2, 3])
  })

  it('returns a LazyCollection', () => {
    const result = collect([1, 2]).lazy().throttle(1)
    expect(result).toBeInstanceOf(LazyCollection)
  })

  it('preserves item order', () => {
    const result = collect(['a', 'b', 'c']).lazy().throttle(0.5).all()
    expect(result).toEqual(['a', 'b', 'c'])
  })

  it('works on an empty collection', () => {
    const result = collect<number>([]).lazy().throttle(1).all()
    expect(result).toEqual([])
  })

  it('is chainable with other lazy methods', () => {
    const result = collect([1, 2, 3, 4])
      .lazy()
      .throttle(1)
      .filter((v) => v > 2)
      .all()
    expect(result).toEqual([3, 4])
  })

  it('is chainable with map', () => {
    const result = collect([1, 2, 3]).lazy().throttle(1).map((v) => v * 10).all()
    expect(result).toEqual([10, 20, 30])
  })
})
