import { collect, Collection } from '../collect'

describe('Collection.make (static)', () => {
  it('creates a Collection from an array', () => {
    const c = Collection.make([1, 2, 3])
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('creates an empty Collection when no args', () => {
    const c = Collection.make()
    expect(c.all()).toEqual([])
  })

  it('returns a Collection instance', () => {
    expect(Collection.make([1, 2])).toBeInstanceOf(Collection)
  })

  it('works with strings', () => {
    const c = Collection.make(['a', 'b', 'c'])
    expect(c.all()).toEqual(['a', 'b', 'c'])
  })

  it('works with objects', () => {
    const c = Collection.make([{ id: 1 }, { id: 2 }])
    expect(c.all()).toEqual([{ id: 1 }, { id: 2 }])
  })
})

describe('make (instance method)', () => {
  it('maps items using callback and returns new Collection', () => {
    const result = collect([1, 2, 3]).make((v) => v * 10)
    expect(result.all()).toEqual([10, 20, 30])
  })

  it('returns a Collection instance', () => {
    expect(collect([1, 2]).make((v) => v)).toBeInstanceOf(Collection)
  })

  it('callback receives item, index, and array', () => {
    const result = collect(['a', 'b']).make((item, index) => `${index}:${item}`)
    expect(result.all()).toEqual(['0:a', '1:b'])
  })

  it('returns empty Collection for empty input', () => {
    expect(
      collect([])
        .make((v) => v)
        .all()
    ).toEqual([])
  })

  it('can transform type', () => {
    const result = collect([1, 2, 3]).make((v) => String(v))
    expect(result.all()).toEqual(['1', '2', '3'])
  })
})
