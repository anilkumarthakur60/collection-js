import { collect } from '../src'

describe('before', () => {
  it('returns the item before the given item', () => {
    expect(collect([1, 2, 3, 4]).before(3)).toBe(2)
  })

  it('returns null when item is the first element', () => {
    expect(collect([1, 2, 3]).before(1)).toBeUndefined()
  })

  it('returns null when item is not found', () => {
    expect(collect([1, 2, 3]).before(99)).toBeUndefined()
  })

  it('returns null for empty collection', () => {
    expect(collect([]).before(1)).toBeUndefined()
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).before('c')).toBe('b')
  })

  it('returns null for string not found', () => {
    expect(collect(['a', 'b', 'c']).before('z')).toBeUndefined()
  })

  it('uses loose comparison by default', () => {
    expect(collect([1, 2, 3]).before('2' as unknown as number)).toBe(1)
  })

  it('uses strict comparison when strict is true', () => {
    expect(collect([1, 2, 3]).before('2' as unknown as number, true)).toBeUndefined()
  })

  it('works with a predicate function', () => {
    expect(collect([1, 2, 3, 4]).before((v) => v === 3)).toBe(2)
  })

  it('returns null when predicate matches first item', () => {
    expect(collect([1, 2, 3]).before((v) => v === 1)).toBeUndefined()
  })

  it('returns null when predicate does not match', () => {
    expect(collect([1, 2, 3]).before((v) => v === 99)).toBeUndefined()
  })

  it('works with objects using predicate', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).before((v) => v.id === 3)).toEqual({ id: 2 })
  })

  it('returns last item before the last element', () => {
    expect(collect([10, 20, 30]).before(30)).toBe(20)
  })
})
