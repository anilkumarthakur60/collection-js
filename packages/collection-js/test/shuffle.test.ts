import { collect } from '../src'

describe('shuffle', () => {
  it('returns collection with same items', () => {
    const items = [1, 2, 3, 4, 5]
    const result = collect(items).shuffle()
    expect(result.all().sort()).toEqual([1, 2, 3, 4, 5])
  })

  it('returns same count of items', () => {
    expect(collect([1, 2, 3, 4, 5]).shuffle().count()).toBe(5)
  })

  it('does not mutate original', () => {
    const c = collect([1, 2, 3])
    c.shuffle()
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).shuffle().all()).toEqual([])
  })

  it('returns single item for single-item collection', () => {
    expect(collect([42]).shuffle().all()).toEqual([42])
  })

  it('contains all original items', () => {
    const original = ['a', 'b', 'c', 'd']
    const shuffled = collect(original).shuffle().all()
    original.forEach((item) => {
      expect(shuffled).toContain(item)
    })
  })

  it('works with objects', () => {
    const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const result = collect(items).shuffle()
    expect(result.count()).toBe(3)
    result.all().forEach((item) => {
      expect([1, 2, 3]).toContain(item.id)
    })
  })
})
