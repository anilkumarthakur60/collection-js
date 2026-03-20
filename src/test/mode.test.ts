import { collect } from '../collect'

describe('mode', () => {
  it('returns the most frequent value', () => {
    expect(collect([1, 2, 2, 3]).mode()).toBe(2)
  })

  it('returns multiple modes when tied', () => {
    const result = collect([1, 1, 2, 2, 3]).mode()
    expect(Array.isArray(result)).toBe(true)
    expect(result).toEqual(expect.arrayContaining([1, 2]))
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).mode()).toBeUndefined()
  })

  it('returns single item for single-item collection', () => {
    expect(collect([42]).mode()).toBe(42)
  })

  it('works with a callback', () => {
    const items = [{ v: 1 }, { v: 2 }, { v: 2 }]
    expect(collect(items).mode((item) => item.v)).toEqual({ v: 2 })
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'b', 'c']).mode()).toBe('b')
  })

  it('returns one item when all same', () => {
    expect(collect([5, 5, 5]).mode()).toBe(5)
  })
})
