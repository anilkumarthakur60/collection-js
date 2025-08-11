import { collect } from '../collect'

describe('all', () => {
  it('returns all items as an array', () => {
    expect(collect([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('returns empty array for empty collection', () => {
    expect(collect([]).all()).toEqual([])
  })

  it('returns all string items', () => {
    expect(collect(['a', 'b', 'c']).all()).toEqual(['a', 'b', 'c'])
  })

  it('returns all object items', () => {
    const items = [{ id: 1 }, { id: 2 }]
    expect(collect(items).all()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('filters items when predicate is provided', () => {
    expect(collect([1, 2, 3, 4, 5]).all((item) => item > 2)).toEqual([3, 4, 5])
  })

  it('filters with predicate that matches none', () => {
    expect(collect([1, 2, 3]).all((item) => item > 10)).toEqual([])
  })

  it('filters with predicate that matches all', () => {
    expect(collect([1, 2, 3]).all((item) => item > 0)).toEqual([1, 2, 3])
  })

  it('predicate receives index as second argument', () => {
    expect(collect(['a', 'b', 'c']).all((_item, index) => index >= 1)).toEqual(['b', 'c'])
  })

  it('returns same reference to internal array without predicate', () => {
    const items = [1, 2, 3]
    const c = collect(items)
    expect(c.all()).toBe(items)
  })

  it('works with mixed type items', () => {
    const items = [1, 'two', true, null] as unknown[]
    expect(collect(items as number[]).all()).toEqual([1, 'two', true, null])
  })
})
