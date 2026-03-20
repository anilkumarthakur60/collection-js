import { collect } from '../src/collect'

describe('where', () => {
  it('filters by key-value equality', () => {
    const items = [{ status: 'active' }, { status: 'inactive' }, { status: 'active' }]
    expect(collect(items).where('status', 'active').all()).toHaveLength(2)
  })

  it('returns empty when no match', () => {
    const items = [{ id: 1 }, { id: 2 }]
    expect(collect(items).where('id', 99).all()).toEqual([])
  })

  it('supports > operator', () => {
    const items = [{ age: 20 }, { age: 30 }, { age: 25 }]
    expect(collect(items).where('age', '>', 25).all()).toEqual([{ age: 30 }])
  })

  it('supports < operator', () => {
    const items = [{ age: 20 }, { age: 30 }, { age: 25 }]
    expect(collect(items).where('age', '<', 25).all()).toEqual([{ age: 20 }])
  })

  it('supports >= operator', () => {
    const items = [{ age: 20 }, { age: 25 }, { age: 30 }]
    expect(collect(items).where('age', '>=', 25).all()).toHaveLength(2)
  })

  it('supports <= operator', () => {
    const items = [{ age: 20 }, { age: 25 }, { age: 30 }]
    expect(collect(items).where('age', '<=', 25).all()).toHaveLength(2)
  })

  it('supports !== operator', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).where('id', '!==', 2).all()).toHaveLength(2)
  })
})

describe('whereStrict', () => {
  it('filters with strict equality', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 1 }]
    expect(collect(items).whereStrict('id', 1).all()).toHaveLength(2)
  })
})

describe('whereBetween', () => {
  it('filters items between min and max inclusive', () => {
    const items = [{ score: 10 }, { score: 50 }, { score: 100 }, { score: 75 }]
    const result = collect(items).whereBetween('score', 50, 100)
    expect(result.all()).toEqual([{ score: 50 }, { score: 100 }, { score: 75 }])
  })

  it('returns empty when nothing in range', () => {
    const items = [{ v: 1 }, { v: 2 }]
    expect(collect(items).whereBetween('v', 5, 10).all()).toEqual([])
  })
})

describe('whereIn', () => {
  it('filters items whose key is in values array', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).whereIn('id', [1, 3]).all()).toEqual([{ id: 1 }, { id: 3 }])
  })

  it('returns empty when no match', () => {
    const items = [{ id: 1 }, { id: 2 }]
    expect(collect(items).whereIn('id', [5, 6]).all()).toEqual([])
  })
})

describe('whereNotIn', () => {
  it('filters items whose key is NOT in values array', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).whereNotIn('id', [2]).all()).toEqual([{ id: 1 }, { id: 3 }])
  })
})

describe('whereNull', () => {
  it('returns items where key is null', () => {
    const items = [{ name: null }, { name: 'Alice' }, { name: undefined }]
    const result = collect(items).whereNull('name')
    expect(result.count()).toBe(2)
  })
})

describe('whereNotNull', () => {
  it('returns items where key is not null', () => {
    const items = [{ name: 'Alice' }, { name: null }, { name: 'Bob' }]
    const result = collect(items).whereNotNull('name')
    expect(result.count()).toBe(2)
  })
})

describe('whereInstanceOf', () => {
  it('filters items by class type', () => {
    class Foo {}
    class Bar {}
    const items = [new Foo(), new Bar(), new Foo()]
    const result = collect(items as unknown[]).whereInstanceOf(Foo)
    expect(result.count()).toBe(2)
  })
})

describe('whereNotBetween', () => {
  it('filters items outside min/max range', () => {
    const items = [{ v: 1 }, { v: 5 }, { v: 10 }, { v: 15 }]
    const result = collect(items).whereNotBetween('v', 5, 10)
    expect(result.all()).toEqual([{ v: 1 }, { v: 15 }])
  })
})
