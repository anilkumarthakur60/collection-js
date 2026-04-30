import { collect } from '../src'

describe('flip', () => {
  it('flips string values to their indices', () => {
    const result = collect(['a', 'b', 'c']).flip().all()
    expect(result[0]).toEqual({ a: 0, b: 1, c: 2 })
  })

  it('flips number values to their indices', () => {
    const result = collect([10, 20, 30]).flip().all()
    expect(result[0]).toEqual({ '10': 0, '20': 1, '30': 2 })
  })

  it('returns single-item collection with an object', () => {
    const result = collect(['x', 'y']).flip()
    expect(result.count()).toBe(1)
  })

  it('coerces non-scalar items via String() (does not throw)', () => {
    const result = collect([{ id: 1 }] as unknown as string[]).flip().all()
    expect(result[0]).toEqual({ '[object Object]': 0 })
  })

  it('handles single item', () => {
    const result = collect(['hello']).flip().all()
    expect(result[0]).toEqual({ hello: 0 })
  })

  it('returns empty object for empty collection', () => {
    const result = collect([]).flip().all()
    expect(result[0]).toEqual({})
  })
})
