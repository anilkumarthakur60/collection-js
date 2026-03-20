import { collect } from '../src/collect'

describe('after', () => {
  it('returns the item after the given item', () => {
    expect(collect([1, 2, 3, 4]).after(2)).toBe(3)
  })

  it('returns the first item after the first element', () => {
    expect(collect([1, 2, 3]).after(1)).toBe(2)
  })

  it('returns null when the item is the last element', () => {
    expect(collect([1, 2, 3]).after(3)).toBeNull()
  })

  it('returns null when the item is not found', () => {
    expect(collect([1, 2, 3]).after(99)).toBeNull()
  })

  it('returns null for empty collection', () => {
    expect(collect([]).after(1)).toBeNull()
  })

  it('works with strings', () => {
    expect(collect(['a', 'b', 'c']).after('b')).toBe('c')
  })

  it('returns null for string not found', () => {
    expect(collect(['a', 'b', 'c']).after('z')).toBeNull()
  })

  it('uses loose comparison by default', () => {
    expect(collect([1, 2, 3]).after('1' as unknown as number)).toBe(2)
  })

  it('uses strict comparison when strict is true', () => {
    expect(collect([1, 2, 3]).after('1' as unknown as number, true)).toBeNull()
  })

  it('works with a predicate function', () => {
    expect(collect([1, 2, 3, 4]).after((v) => v === 2)).toBe(3)
  })

  it('returns null when predicate matches last item', () => {
    expect(collect([1, 2, 3]).after((v) => v === 3)).toBeNull()
  })

  it('returns null when predicate does not match', () => {
    expect(collect([1, 2, 3]).after((v) => v === 99)).toBeNull()
  })

  it('works with objects', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    expect(collect(items).after((v) => v.id === 1)).toEqual({ id: 2 })
  })
})
