import { collect } from '../src/collect'

describe('unique', () => {
  it('removes duplicate values', () => {
    expect(collect([1, 2, 2, 3, 3, 3]).unique().all()).toEqual([1, 2, 3])
  })

  it('returns same items when all unique', () => {
    expect(collect([1, 2, 3]).unique().all()).toEqual([1, 2, 3])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).unique().all()).toEqual([])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'a', 'c']).unique().all()).toEqual(['a', 'b', 'c'])
  })

  it('uses callback for uniqueness', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Alice' },
      { id: 3, name: 'Bob' }
    ]
    const result = collect(items).unique((v) => v.name)
    expect(result.count()).toBe(2)
    expect(result.all()[0].name).toBe('Alice')
    expect(result.all()[1].name).toBe('Bob')
  })

  it('uses key for uniqueness', () => {
    const items = [
      { type: 'A', val: 1 },
      { type: 'B', val: 2 },
      { type: 'A', val: 3 }
    ]
    const result = collect(items).unique('type')
    expect(result.count()).toBe(2)
  })
})

describe('uniqueStrict', () => {
  it('removes strict duplicates', () => {
    expect(collect([1, 1, 2, 3]).uniqueStrict().all()).toEqual([1, 2, 3])
  })

  it('does not remove items with loose equality only', () => {
    const items = [1, '1', 2] as unknown as number[]
    const result = collect(items).uniqueStrict()
    expect(result.count()).toBe(3)
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).uniqueStrict().all()).toEqual([])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'a']).uniqueStrict().all()).toEqual(['a', 'b'])
  })
})
