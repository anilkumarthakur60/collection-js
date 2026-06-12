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

  it('returns a copy, not the live internal array (regression: all() leaked the backing array)', () => {
    const items = [1, 2, 3]
    const c = collect(items)
    expect(c.all()).not.toBe(items)
    expect(c.all()).toEqual(items)
  })

  it('mutating the returned array does not corrupt the collection', () => {
    const c = collect([1, 2, 3])
    c.all().push(99)
    expect(c.count()).toBe(3)
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('toJSON and valueOf also return copies (regression)', () => {
    const c = collect([1, 2, 3])
    c.toJSON().push(99)
    c.valueOf().push(99)
    expect(c.all()).toEqual([1, 2, 3])
    expect(JSON.stringify(c)).toBe('[1,2,3]')
  })

  it('use .filter() for predicate-based filtering', () => {
    expect(
      collect([1, 2, 3, 4, 5])
        .filter((item) => item > 2)
        .all()
    ).toEqual([3, 4, 5])
  })

  it('works with mixed type items', () => {
    const items = [1, 'two', true, null] as unknown[]
    expect(collect(items as number[]).all()).toEqual([1, 'two', true, null])
  })
})
