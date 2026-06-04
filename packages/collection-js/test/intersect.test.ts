import { collect } from '../src'

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
    expect(collect<number>([]).intersect([1, 2]).all()).toEqual([])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).intersect(['b', 'c', 'd']).all()).toEqual(['b', 'c'])
  })

  it('accepts a Collection argument', () => {
    expect(collect([1, 2, 3]).intersect(collect([2, 3])).all()).toEqual([2, 3])
  })
})

describe('intersectUsing', () => {
  it('uses comparator for equality', () => {
    const result = collect([1, 2, 3]).intersectUsing([2, 4], (a, b) => a - b)
    expect(result.all()).toEqual([2])
  })

  it('returns empty when comparator never matches', () => {
    const result = collect([1, 3, 5]).intersectUsing([2, 4], (a, b) => a - b)
    expect(result.all()).toEqual([])
  })
})

describe('intersectAssoc', () => {
  it('keeps key/value pairs present in both objects', () => {
    const items = [{ color: 'red', size: 'M', material: 'cotton' }]
    const result = collect(items).intersectAssoc([{ color: 'blue', size: 'M', material: 'polyester' }])
    expect(result.all()).toEqual([{ size: 'M' }])
  })
})

describe('intersectAssocUsing', () => {
  it('uses comparator for both keys and values', () => {
    const items = [{ color: 'red', Size: 'M', material: 'cotton' }]
    const cmp = (a: string, b: string) => a.toLowerCase().localeCompare(b.toLowerCase())
    const result = collect(items).intersectAssocUsing(
      { color: 'blue', size: 'M', material: 'polyester' },
      cmp,
    )
    expect(result.all()).toEqual([{ Size: 'M' }])
  })
})

describe('intersectByKeys', () => {
  it('keeps only keys present in the given list', () => {
    const items = [{ serial: 'UX301', type: 'screen', year: 2009 }]
    const result = collect(items).intersectByKeys(['type', 'year'])
    expect(result.all()).toEqual([{ type: 'screen', year: 2009 }])
  })

  it('returns objects with no overlap as empty objects', () => {
    const items = [{ a: 1 }]
    const result = collect(items).intersectByKeys(['z'])
    expect(result.all()).toEqual([{}])
  })
})
