import { collect } from '../src'

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

  it('returns same reference to internal array (filtering moved to .filter)', () => {
    const items = [1, 2, 3]
    const c = collect(items)
    expect(c.all()).toBe(items)
  })

  it('use .filter() for predicate-based filtering', () => {
    expect(collect([1, 2, 3, 4, 5]).filter((item) => item > 2).all()).toEqual([3, 4, 5])
  })

  it('works with mixed type items', () => {
    const items = [1, 'two', true, null] as unknown[]
    expect(collect(items as number[]).all()).toEqual([1, 'two', true, null])
  })
})
