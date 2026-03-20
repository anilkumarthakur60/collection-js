import { collect } from '../collect'

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
    expect(collect([]).diff([1, 2]).all()).toEqual([])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).diff(['b']).all()).toEqual(['a', 'c'])
  })

  it('accepts a Collection argument', () => {
    expect(
      collect([1, 2, 3])
        .diff(collect([2]))
        .all()
    ).toEqual([1, 3])
  })
})

describe('diffAssoc', () => {
  it('returns items not in the other collection', () => {
    expect(collect([1, 2, 3]).diffAssoc([2, 3]).all()).toEqual([1])
  })

  it('accepts a Collection argument', () => {
    expect(
      collect([1, 2, 3])
        .diffAssoc(collect([1, 3]))
        .all()
    ).toEqual([2])
  })
})

describe('diffAssocUsing', () => {
  it('returns items not matching by callback key', () => {
    const result = collect([{ id: 1 }, { id: 2 }, { id: 3 }]).diffAssocUsing(
      [{ id: 2 }, { id: 3 }],
      (item) => (item as { id: number }).id
    )
    expect(result.all()).toEqual([{ id: 1 }])
  })

  it('returns all items when no match by callback', () => {
    const result = collect([1, 2, 3]).diffAssocUsing([4, 5], (v) => v)
    expect(result.all()).toEqual([1, 2, 3])
  })
})

describe('diffKeys', () => {
  it('returns items whose keys are not in the other collection', () => {
    const a = [{ name: 'Alice', age: 30 }]
    const b = [{ name: 'Bob' }]
    const result = collect(a).diffKeys(b)
    expect(result.count()).toBe(0)
  })

  it('returns items when keys do not overlap', () => {
    const a = [{ age: 30 }]
    const b = [{ name: 'Bob' }]
    const result = collect(a).diffKeys(b)
    expect(result.all()).toEqual([{ age: 30 }])
  })
})
