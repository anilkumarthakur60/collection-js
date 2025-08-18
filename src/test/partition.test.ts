import { collect, Collection } from '../collect'

describe('partition', () => {
  it('splits collection into two groups', () => {
    const [evens, odds] = collect([1, 2, 3, 4, 5]).partition((v) => v % 2 === 0)
    expect(evens.all()).toEqual([2, 4])
    expect(odds.all()).toEqual([1, 3, 5])
  })

  it('returns empty second partition when all match', () => {
    const [truthy, falsy] = collect([2, 4, 6]).partition((v) => v % 2 === 0)
    expect(truthy.all()).toEqual([2, 4, 6])
    expect(falsy.all()).toEqual([])
  })

  it('returns empty first partition when none match', () => {
    const [truthy, falsy] = collect([1, 3, 5]).partition((v) => v % 2 === 0)
    expect(truthy.all()).toEqual([])
    expect(falsy.all()).toEqual([1, 3, 5])
  })

  it('returns two Collection instances', () => {
    const [a, b] = collect([1]).partition(() => true)
    expect(a).toBeInstanceOf(Collection)
    expect(b).toBeInstanceOf(Collection)
  })

  it('handles empty collection', () => {
    const [a, b] = collect([]).partition(() => true)
    expect(a.all()).toEqual([])
    expect(b.all()).toEqual([])
  })

  it('works with objects', () => {
    const items = [{ active: true }, { active: false }, { active: true }]
    const [active, inactive] = collect(items).partition((v) => v.active)
    expect(active.count()).toBe(2)
    expect(inactive.count()).toBe(1)
  })
})
