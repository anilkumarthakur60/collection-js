import { collect } from '../collect'

describe('intersect', () => {
  it('returns items that exist in both collections', () => {
    expect(collect([1, 2, 3, 4]).intersect([2, 4, 6]).all()).toEqual([2, 4])
  })

  it('returns empty when no overlap', () => {
    expect(collect([1, 2, 3]).intersect([4, 5, 6]).all()).toEqual([])
  })

  it('returns all when fully overlapping', () => {
    expect(collect([1, 2, 3]).intersect([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).intersect([1, 2]).all()).toEqual([])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).intersect(['b', 'c', 'd']).all()).toEqual(['b', 'c'])
  })
})

describe('intersectUsing', () => {
  it('uses callback for comparison', () => {
    const result = collect([1, 2, 3]).intersectUsing([2, 4], (a, b) => a - b)
    expect(result.all()).toEqual([2])
  })

  it('returns empty when no items match', () => {
    const result = collect([1, 3, 5]).intersectUsing([2, 4], (a, b) => a - b)
    expect(result.all()).toEqual([])
  })
})

describe('intersectAssoc', () => {
  it('returns items present in both arrays', () => {
    expect(collect([1, 2, 3]).intersectAssoc([2, 3, 4]).all()).toEqual([2, 3])
  })

  it('returns empty when no match', () => {
    expect(collect([1, 2]).intersectAssoc([3, 4]).all()).toEqual([])
  })
})

describe('intersectAssocUsing', () => {
  it('intersects objects by key comparison callback', () => {
    const items = [{ name: 'Alice', age: 30 }]
    const values = { name: 'Alice', age: 30 }
    const result = collect(items).intersectAssocUsing(values, (a, b) => a.localeCompare(b))
    expect(result.count()).toBe(1)
  })
})

describe('intersectByKeys', () => {
  it('returns items that match given keys', () => {
    const result = collect(['a', 'b', 'c']).intersectByKeys(['a', 'c'] as unknown as string[])
    expect(result.all()).toEqual(['a', 'c'])
  })

  it('returns empty when no items match', () => {
    const result = collect([1, 2, 3]).intersectByKeys([4, 5] as unknown as number[])
    expect(result.all()).toEqual([])
  })
})
