import { collect } from '../src'

describe('toJson', () => {
  it('returns JSON string of items', () => {
    expect(collect([1, 2, 3]).toJson()).toBe('[1,2,3]')
  })

  it('returns empty array JSON for empty collection', () => {
    expect(collect([]).toJson()).toBe('[]')
  })

  it('serializes string items', () => {
    expect(collect(['a', 'b']).toJson()).toBe('["a","b"]')
  })

  it('serializes object items', () => {
    expect(collect([{ id: 1 }]).toJson()).toBe('[{"id":1}]')
  })

  it('returns valid parseable JSON', () => {
    const json = collect([1, 2, 3]).toJson()
    expect(JSON.parse(json)).toEqual([1, 2, 3])
  })
})

describe('toPrettyJson', () => {
  it('returns pretty-printed JSON', () => {
    const result = collect([1, 2]).toPrettyJson()
    expect(result).toContain('\n')
    expect(JSON.parse(result)).toEqual([1, 2])
  })

  it('returns empty array pretty JSON', () => {
    expect(collect([]).toPrettyJson()).toBe('[]')
  })

  it('uses 2-space indentation', () => {
    const result = collect([{ id: 1 }]).toPrettyJson()
    expect(result).toBe(JSON.stringify([{ id: 1 }], null, 2))
  })
})

describe('toArray', () => {
  it('returns items as array', () => {
    expect(collect([1, 2, 3]).toArray()).toEqual([1, 2, 3])
  })

  it('returns empty array for empty collection', () => {
    expect(collect([]).toArray()).toEqual([])
  })

  it('returns a fresh array (use all() for reference)', () => {
    const items = [1, 2, 3]
    const c = collect(items)
    expect(c.toArray()).toEqual(items)
    expect(c.toArray()).not.toBe(items)
    expect(c.all()).toBe(items)
  })

  it('works with objects', () => {
    const items = [{ id: 1 }]
    expect(collect(items).toArray()).toEqual([{ id: 1 }])
  })
})
