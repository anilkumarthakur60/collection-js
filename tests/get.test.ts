import { collect } from '../src/collect'

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
    expect(collect([]).get(0, 'default')).toBe('default')
  })

  it('works with object items', () => {
    expect(collect([{ id: 1 }, { id: 2 }]).get(1)).toEqual({ id: 2 })
  })
})
