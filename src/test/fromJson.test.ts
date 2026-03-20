import { Collection } from '../collect'

describe('Collection.fromJson', () => {
  it('parses a JSON array of numbers', () => {
    const c = Collection.fromJson<number>('[1, 2, 3]')
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('parses a JSON array of strings', () => {
    const c = Collection.fromJson<string>('["a", "b", "c"]')
    expect(c.all()).toEqual(['a', 'b', 'c'])
  })

  it('parses a JSON array of objects', () => {
    const c = Collection.fromJson<{ id: number }>('[{"id":1},{"id":2}]')
    expect(c.all()).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('wraps a single JSON object in an array', () => {
    const c = Collection.fromJson<{ name: string }>('{"name":"Alice"}')
    expect(c.all()).toEqual([{ name: 'Alice' }])
  })

  it('returns a Collection instance', () => {
    const c = Collection.fromJson<number>('[1, 2]')
    expect(c).toBeInstanceOf(Collection)
  })

  it('parses empty JSON array', () => {
    const c = Collection.fromJson<number>('[]')
    expect(c.all()).toEqual([])
  })

  it('throws on invalid JSON', () => {
    expect(() => Collection.fromJson('not-json')).toThrow()
  })

  it('parses JSON array of booleans', () => {
    const c = Collection.fromJson<boolean>('[true, false, true]')
    expect(c.all()).toEqual([true, false, true])
  })
})
