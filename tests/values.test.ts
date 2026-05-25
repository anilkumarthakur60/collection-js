import { collect, Collection } from '../src'

describe('values', () => {
  it('returns a new Collection with same items', () => {
    const result = collect([1, 2, 3]).values()
    expect(result.all()).toEqual([1, 2, 3])
  })

  it('returns a Collection instance', () => {
    expect(collect([1, 2]).values()).toBeInstanceOf(Collection)
  })

  it('returns empty Collection for empty input', () => {
    expect(collect([]).values().all()).toEqual([])
  })

  it('is a different reference from original', () => {
    const c = collect([1, 2, 3])
    const v = c.values()
    expect(v).not.toBe(c)
  })

  it('works with objects', () => {
    const items = [{ id: 1 }, { id: 2 }]
    expect(collect(items).values().all()).toEqual([{ id: 1 }, { id: 2 }])
  })
})

describe('value', () => {
  it('returns specific key from first item', () => {
    const items = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ]
    expect(collect(items).value('name')).toBe('Alice')
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).value('id')).toBeUndefined()
  })

  it('returns nested values via dot path', () => {
    const items = [{ user: { age: 30 } }]
    expect(collect(items).value('user.age')).toBe(30)
  })
})
