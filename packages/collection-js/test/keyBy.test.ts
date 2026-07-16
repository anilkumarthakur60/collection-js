import { collect } from '../src'

describe('keyBy', () => {
  it('keys items by a property', () => {
    const items = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' },
    ]
    expect(collect(items).keyBy('id')).toEqual({
      a: { id: 'a', name: 'Alice' },
      b: { id: 'b', name: 'Bob' },
    })
  })

  it('keys items by callback', () => {
    const items = [
      { code: 'US', label: 'United States' },
      { code: 'CA', label: 'Canada' },
    ]
    const result = collect(items).keyBy((item) => item.code)
    expect(result['US']).toEqual({ code: 'US', label: 'United States' })
    expect(result['CA']).toEqual({ code: 'CA', label: 'Canada' })
  })

  it('overwrites duplicate keys with last value', () => {
    const items = [
      { type: 'A', val: 1 },
      { type: 'A', val: 2 },
    ]
    expect(collect(items).keyBy('type')['A'].val).toBe(2)
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).keyBy('id' as never)).toEqual({})
  })

  it('callback receives index', () => {
    const result = collect(['a', 'b', 'c']).keyBy((_item, index) => `index-${index}`)
    expect(result['index-0']).toBe('a')
    expect(result['index-2']).toBe('c')
  })
})

describe('keys', () => {
  it('returns numeric index keys for primitive array', () => {
    expect(collect([10, 20, 30]).keys().all()).toEqual(['0', '1', '2'])
  })

  it('returns merged keys for object array', () => {
    const items = [{ a: 1, b: 2 }, { c: 3 }]
    const out = collect(items).keys().all()
    expect(out).toContain('a')
    expect(out).toContain('b')
    expect(out).toContain('c')
  })

  it('returns empty array for empty collection', () => {
    expect(collect([]).keys().all()).toEqual([])
  })

  it('deduplicates keys across multiple objects', () => {
    expect(collect([{ id: 1 }, { id: 2 }]).keys().all()).toEqual(['id'])
  })
})
