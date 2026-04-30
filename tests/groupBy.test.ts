import { collect } from '../src'

describe('groupBy', () => {
  it('groups by a key', () => {
    const items = [
      { type: 'fruit', name: 'apple' },
      { type: 'vegetable', name: 'carrot' },
      { type: 'fruit', name: 'banana' }
    ]
    const result = collect(items).groupBy('type')
    expect(result['fruit']).toHaveLength(2)
    expect(result['vegetable']).toHaveLength(1)
  })

  it('groups by callback', () => {
    const items = [1, 2, 3, 4, 5, 6]
    const result = collect(items).groupBy((v) => (v % 2 === 0 ? 'even' : 'odd'))
    expect(result['even']).toEqual([2, 4, 6])
    expect(result['odd']).toEqual([1, 3, 5])
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).groupBy('id' as never)).toEqual({})
  })

  it('groups all items into one group when key matches all', () => {
    const items = [{ type: 'A' }, { type: 'A' }]
    const result = collect(items).groupBy('type')
    expect(Object.keys(result)).toHaveLength(1)
    expect(result['A']).toHaveLength(2)
  })

  it('groups each item separately when keys are all unique', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = collect(items).groupBy('id')
    expect(Object.keys(result)).toHaveLength(3)
  })

  it('callback receives index as second argument', () => {
    const result = collect(['a', 'b', 'c']).groupBy((_item, index) =>
      index < 2 ? 'first' : 'rest'
    )
    expect(result['first']).toEqual(['a', 'b'])
    expect(result['rest']).toEqual(['c'])
  })
})
