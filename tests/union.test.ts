import { collect } from '../src/collect'

describe('union', () => {
  it('adds items not already in the collection', () => {
    expect(collect([1, 2, 3]).union([2, 3, 4, 5]).all()).toEqual([1, 2, 3, 4, 5])
  })

  it('returns same items when union has only existing items', () => {
    expect(collect([1, 2, 3]).union([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('adds all items when none overlap', () => {
    expect(collect([1, 2]).union([3, 4]).all()).toEqual([1, 2, 3, 4])
  })

  it('returns same items when union is empty', () => {
    expect(collect([1, 2, 3]).union([]).all()).toEqual([1, 2, 3])
  })

  it('adds all items when original is empty', () => {
    expect(collect([]).union([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b']).union(['b', 'c']).all()).toEqual(['a', 'b', 'c'])
  })

  it('works with objects by deep equality', () => {
    const items = [{ id: 1 }]
    const result = collect(items).union([{ id: 1 }, { id: 2 }])
    expect(result.count()).toBe(2)
  })
})
