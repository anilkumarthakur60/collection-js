import { collect } from '../src/collect'

describe('keyBy', () => {
  it('keys items by a property', () => {
    const items = [
      { id: 'a', name: 'Alice' },
      { id: 'b', name: 'Bob' }
    ]
    const result = collect(items).keyBy('id')
    expect(result).toEqual({ a: { id: 'a', name: 'Alice' }, b: { id: 'b', name: 'Bob' } })
  })

  it('keys items by callback', () => {
    const items = [
      { code: 'US', label: 'United States' },
      { code: 'CA', label: 'Canada' }
    ]
    const result = collect(items).keyBy((item) => item.code)
    expect(result['US']).toEqual({ code: 'US', label: 'United States' })
    expect(result['CA']).toEqual({ code: 'CA', label: 'Canada' })
  })

  it('overwrites duplicate keys with last value', () => {
    const items = [
      { type: 'A', val: 1 },
      { type: 'A', val: 2 }
    ]
    const result = collect(items).keyBy('type')
    expect(result['A'].val).toBe(2)
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).keyBy('id' as never)).toEqual({})
  })

  it('callback receives index', () => {
    const items = ['a', 'b', 'c']
    const result = collect(items).keyBy((_item, index) => `index-${index}`)
    expect(result['index-0']).toBe('a')
    expect(result['index-2']).toBe('c')
  })
})

describe('keys', () => {
  it('returns index keys for primitive array', () => {
    const result = collect([10, 20, 30]).keys()
    expect(result).toEqual(['0', '1', '2'])
  })

  it('returns merged keys for object array', () => {
    const items = [{ a: 1, b: 2 }, { c: 3 }]
    const result = collect(items).keys()
    expect(result).toContain('a')
    expect(result).toContain('b')
    expect(result).toContain('c')
  })

  it('returns empty array for empty collection', () => {
    expect(collect([]).keys()).toEqual([])
  })

  it('deduplicates keys from multiple objects', () => {
    const items = [{ id: 1 }, { id: 2 }]
    const result = collect(items).keys()
    expect(result).toEqual(['id'])
  })
})
