import { collect } from '../src'

describe('has', () => {
  it('returns true when key exists in any item', () => {
    const items = [{ id: 1, name: 'Alice' }]
    expect(collect(items).has('id')).toBe(true)
  })

  it('returns false when key does not exist', () => {
    const items = [{ id: 1 }]
    expect(collect(items).has('name' as keyof { id: number })).toBe(false)
  })

  it('returns true when all keys in array exist', () => {
    const items = [{ id: 1, name: 'Alice' }]
    expect(collect(items).has(['id', 'name'])).toBe(true)
  })

  it('returns false when one key in array does not exist', () => {
    const items = [{ id: 1 }]
    expect(collect(items).has(['id', 'name'] as Array<keyof { id: number }>)).toBe(false)
  })

  it('returns false for empty collection', () => {
    expect(collect([]).has('id' as never)).toBe(false)
  })
})

describe('hasAny', () => {
  it('returns true when at least one key exists', () => {
    const items = [{ id: 1 }]
    expect(collect(items).hasAny(['id', 'name'] as Array<keyof { id: number }>)).toBe(true)
  })

  it('returns false when no keys exist', () => {
    const items = [{ id: 1 }]
    expect(collect(items).hasAny(['name', 'age'] as Array<keyof { id: number }>)).toBe(false)
  })
})

describe('hasMany', () => {
  it('returns true when collection has more than one item', () => {
    expect(collect([1, 2]).hasMany()).toBe(true)
  })

  it('returns false when collection has exactly one item', () => {
    expect(collect([1]).hasMany()).toBe(false)
  })

  it('returns false for empty collection', () => {
    expect(collect([]).hasMany()).toBe(false)
  })

  it('returns true when callback matches more than one item', () => {
    expect(collect([1, 2, 3]).hasMany((v) => v > 1)).toBe(true)
  })

  it('returns false when callback matches exactly one item', () => {
    expect(collect([1, 2, 3]).hasMany((v) => v === 2)).toBe(false)
  })
})

describe('hasSole', () => {
  it('returns true when collection has exactly one item', () => {
    expect(collect([42]).hasSole()).toBe(true)
  })

  it('returns false when collection has more than one item', () => {
    expect(collect([1, 2]).hasSole()).toBe(false)
  })

  it('returns false for empty collection', () => {
    expect(collect([]).hasSole()).toBe(false)
  })

  it('returns true when callback matches exactly one item', () => {
    expect(collect([1, 2, 3]).hasSole((v) => v === 2)).toBe(true)
  })

  it('returns false when callback matches more than one', () => {
    expect(collect([1, 2, 3]).hasSole((v) => v > 1)).toBe(false)
  })
})
