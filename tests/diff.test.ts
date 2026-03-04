import { collect } from '../src'

describe('diff', () => {
  it('returns items not in the other array', () => {
    expect(collect([1, 2, 3, 4]).diff([2, 4]).all()).toEqual([1, 3])
  })

  it('returns all items when nothing matches', () => {
    expect(collect([1, 2, 3]).diff([4, 5, 6]).all()).toEqual([1, 2, 3])
  })

  it('returns empty when all items match', () => {
    expect(collect([1, 2, 3]).diff([1, 2, 3]).all()).toEqual([])
  })

  it('returns empty for empty collection', () => {
    expect(collect<number>([]).diff([1, 2]).all()).toEqual([])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).diff(['b']).all()).toEqual(['a', 'c'])
  })

  it('accepts a Collection argument', () => {
    expect(collect([1, 2, 3]).diff(collect([2])).all()).toEqual([1, 3])
  })
})

describe('diffAssoc', () => {
  it('returns the entries that differ from the given object', () => {
    const items = [{ color: 'orange', type: 'fruit', remain: 6 }]
    const diff = collect(items).diffAssoc([{ color: 'yellow', type: 'fruit', remain: 3, used: 6 }])
    // Object retained because at least one key/value differs
    expect(diff.count()).toBe(1)
  })

  it('returns nothing when all key/value pairs match', () => {
    const items = [{ a: 1, b: 2 }]
    const diff = collect(items).diffAssoc([{ a: 1, b: 2 }])
    expect(diff.all()).toEqual([])
  })
})

describe('diffAssocUsing', () => {
  it('uses a custom comparator to determine equality', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = collect(items).diffAssocUsing([{ id: 2 }, { id: 3 }], (a, b) => a.id - b.id)
    expect(result.all()).toEqual([{ id: 1 }])
  })

  it('returns all items when comparator never matches', () => {
    const result = collect([1, 2, 3]).diffAssocUsing([4, 5], (a, b) => a - b)
    expect(result.all()).toEqual([1, 2, 3])
  })
})

describe('diffKeys', () => {
  it('strips keys present in the given key list from each item', () => {
    const items = [{ name: 'Alice', age: 30 }]
    const result = collect(items).diffKeys(['name'])
    expect(result.all()).toEqual([{ age: 30 }])
  })

  it('returns items unchanged when keys do not overlap', () => {
    const items = [{ age: 30 }]
    const result = collect(items).diffKeys(['name'])
    expect(result.all()).toEqual([{ age: 30 }])
  })
})
