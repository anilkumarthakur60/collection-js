import { collect } from '../src'

describe('get', () => {
  it('returns item at given index', () => {
    expect(collect([10, 20, 30]).get(1)).toBe(20)
  })

  it('returns first item at index 0', () => {
    expect(collect([10, 20, 30]).get(0)).toBe(10)
  })

  it('returns last item at last index', () => {
    expect(collect([10, 20, 30]).get(2)).toBe(30)
  })

  it('returns undefined when index out of bounds and no default', () => {
    expect(collect([1, 2, 3]).get(10)).toBeUndefined()
  })

  it('returns default value when index out of bounds', () => {
    expect(collect([1, 2, 3]).get(10, 99)).toBe(99)
  })

  it('returns default function result when index out of bounds', () => {
    expect(collect([1, 2, 3]).get(10, () => 42)).toBe(42)
  })

  it('works with string items', () => {
    expect(collect(['a', 'b', 'c']).get(2)).toBe('c')
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).get(0)).toBeUndefined()
  })

  it('returns default for empty collection', () => {
    expect(collect<string>([]).get(0, 'default')).toBe('default')
  })

  it('works with object items', () => {
    expect(collect([{ id: 1 }, { id: 2 }]).get(1)).toEqual({ id: 2 })
  })
})

describe('get with present undefined elements (regression: default returned for in-bounds undefined)', () => {
  it('returns the stored undefined instead of the default', () => {
    expect(collect([undefined, 5]).get(0, 99)).toBeUndefined()
  })

  it('resolves negative indices to present undefined slots', () => {
    expect(collect([undefined, 5]).get(-2, 99)).toBeUndefined()
  })

  it('still returns the default for out-of-range indices', () => {
    expect(collect([undefined, 5]).get(5, 99)).toBe(99)
    expect(collect([undefined, 5]).get(-3, 99)).toBe(99)
  })

  it('supports negative indices for present values', () => {
    expect(collect([1, 2, 3]).get(-1)).toBe(3)
    expect(collect([1, 2, 3]).get(-3)).toBe(1)
  })
})
