import { collect } from '../src'
import { ItemNotFoundException } from '../src/exceptions/ItemNotFoundException'

describe('first', () => {
  it('returns the first item', () => {
    expect(collect([1, 2, 3]).first()).toBe(1)
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).first()).toBeUndefined()
  })

  it('returns first matching item with predicate', () => {
    expect(collect([1, 2, 3, 4]).first((v) => v > 2)).toBe(3)
  })

  it('returns undefined when predicate matches nothing', () => {
    expect(collect([1, 2, 3]).first((v) => v > 10)).toBeUndefined()
  })

  it('returns single item for single-item collection', () => {
    expect(collect([42]).first()).toBe(42)
  })
})

describe('firstOrFail', () => {
  it('returns the first item', () => {
    expect(collect([1, 2, 3]).firstOrFail()).toBe(1)
  })

  it('throws ItemNotFoundException for empty collection', () => {
    expect(() => collect([]).firstOrFail()).toThrow(ItemNotFoundException)
  })

  it('returns first matching item with predicate', () => {
    expect(collect([1, 2, 3]).firstOrFail((v) => v > 1)).toBe(2)
  })

  it('throws ItemNotFoundException when predicate matches nothing', () => {
    expect(() => collect([1, 2, 3]).firstOrFail((v) => v > 10)).toThrow(ItemNotFoundException)
  })
})

describe('firstWhere', () => {
  it('finds first item by key-value (loose)', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    expect(collect(items).firstWhere('name', 'Bob')).toEqual({ id: 2, name: 'Bob' })
  })

  it('returns undefined when no match', () => {
    const items = [{ id: 1 }, { id: 2 }]
    expect(collect(items).firstWhere('id', 99)).toBeUndefined()
  })

  it('returns first truthy value for key when only key given', () => {
    const items = [{ id: 0 }, { id: 1 }, { id: 2 }]
    expect(collect(items).firstWhere('id')).toEqual({ id: 1 })
  })

  it('supports < operator (Laravel order: key, operator, value)', () => {
    const items = [{ age: 30 }, { age: 20 }, { age: 25 }]
    expect(collect(items).firstWhere('age', '<', 25)).toEqual({ age: 20 })
  })

  it('supports > operator', () => {
    const items = [{ age: 20 }, { age: 30 }, { age: 25 }]
    expect(collect(items).firstWhere('age', '>', 25)).toEqual({ age: 30 })
  })

  it('supports !== operator', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).firstWhere('id', '!==', 1)).toEqual({ id: 2 })
  })

  it('supports >= operator', () => {
    const items = [{ age: 14 }, { age: 23 }, { age: 84 }]
    expect(collect(items).firstWhere('age', '>=', 18)).toEqual({ age: 23 })
  })

  it('supports dot-path lookups', () => {
    const items = [{ user: { age: 15 } }, { user: { age: 30 } }]
    expect(collect(items).firstWhere('user.age', '>=', 18)).toEqual({ user: { age: 30 } })
  })
})
