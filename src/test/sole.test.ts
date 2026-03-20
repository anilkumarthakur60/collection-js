import { collect } from '../collect'
import { ItemNotFoundException } from '../exceptions/ItemNotFoundException'

describe('sole', () => {
  it('returns the single item when collection has exactly one item', () => {
    expect(collect([42]).sole()).toBe(42)
  })

  it('throws when collection is empty', () => {
    expect(() => collect([]).sole()).toThrow()
  })

  it('throws when collection has multiple items', () => {
    expect(() => collect([1, 2]).sole()).toThrow()
  })

  it('returns single match by key-value', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ]
    expect(collect(items).sole('id', 1)).toEqual({ id: 1, name: 'Alice' })
  })

  it('throws ItemNotFoundException when no key-value match', () => {
    const items = [{ id: 1 }, { id: 2 }]
    expect(() => collect(items).sole('id', 99)).toThrow(ItemNotFoundException)
  })

  it('throws when multiple key-value matches', () => {
    const items = [{ type: 'A' }, { type: 'A' }]
    expect(() => collect(items).sole('type', 'A')).toThrow()
  })

  it('works with predicate function', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).sole((v) => v.id === 2)).toEqual({ id: 2 })
  })

  it('throws with predicate when no match', () => {
    expect(() => collect([1, 2, 3]).sole((v) => v > 10)).toThrow()
  })

  it('throws with predicate when multiple matches', () => {
    expect(() => collect([1, 2, 3]).sole((v) => v > 1)).toThrow()
  })
})
