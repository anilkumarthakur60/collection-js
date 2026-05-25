import { collect } from '../src'

describe('filter', () => {
  it('filters items based on callback', () => {
    expect(
      collect([1, 2, 3, 4, 5])
        .filter((v) => v > 2)
        .all()
    ).toEqual([3, 4, 5])
  })

  it('removes falsy values when no callback provided', () => {
    const items = [0, 1, false, 2, null, 3, undefined, ''] as unknown as number[]
    expect(collect(items).filter().all()).toEqual([1, 2, 3])
  })

  it('returns empty collection when all filtered out', () => {
    expect(
      collect([1, 2, 3])
        .filter((v) => v > 10)
        .all()
    ).toEqual([])
  })

  it('returns all items when all match callback', () => {
    expect(
      collect([1, 2, 3])
        .filter((v) => v > 0)
        .all()
    ).toEqual([1, 2, 3])
  })

  it('provides index to callback', () => {
    expect(
      collect(['a', 'b', 'c'])
        .filter((_v, i) => i > 0)
        .all()
    ).toEqual(['b', 'c'])
  })

  it('does not mutate original collection', () => {
    const c = collect([1, 2, 3])
    c.filter((v) => v > 1)
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('works with empty collection', () => {
    expect(collect([]).filter().all()).toEqual([])
  })

  it('works with objects', () => {
    const items = [{ active: true }, { active: false }, { active: true }]
    expect(
      collect(items)
        .filter((v) => v.active)
        .all()
    ).toEqual([{ active: true }, { active: true }])
  })
})

describe('reject', () => {
  it('removes items that match callback', () => {
    expect(
      collect([1, 2, 3, 4])
        .reject((v) => v % 2 === 0)
        .all()
    ).toEqual([1, 3])
  })

  it('returns all items when no items match', () => {
    expect(
      collect([1, 2, 3])
        .reject((v) => v > 10)
        .all()
    ).toEqual([1, 2, 3])
  })

  it('returns empty when all items match', () => {
    expect(
      collect([2, 4, 6])
        .reject((v) => v % 2 === 0)
        .all()
    ).toEqual([])
  })

  it('returns empty for empty collection', () => {
    expect(
      collect([])
        .reject(() => true)
        .all()
    ).toEqual([])
  })

  it('works with objects', () => {
    const items = [{ active: true }, { active: false }]
    expect(
      collect(items)
        .reject((v) => !v.active)
        .all()
    ).toEqual([{ active: true }])
  })
})
