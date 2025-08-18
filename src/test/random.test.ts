import { collect, Collection } from '../collect'

describe('random', () => {
  it('returns a single random item without count', () => {
    const result = collect([1, 2, 3, 4, 5]).random()
    expect([1, 2, 3, 4, 5]).toContain(result)
  })

  it('returns a Collection when count is provided', () => {
    const result = collect([1, 2, 3, 4, 5]).random(2)
    expect(result).toBeInstanceOf(Collection)
  })

  it('returned Collection has correct count', () => {
    const result = collect([1, 2, 3, 4, 5]).random(3) as Collection<number>
    expect(result.count()).toBe(3)
  })

  it('each returned item exists in original', () => {
    const items = [1, 2, 3, 4, 5]
    const result = collect(items).random(2) as Collection<number>
    result.all().forEach((item) => {
      expect(items).toContain(item)
    })
  })

  it('throws when count exceeds collection size', () => {
    expect(() => collect([1, 2]).random(5)).toThrow()
  })

  it('returns undefined for empty collection without count', () => {
    expect(collect([]).random()).toBeUndefined()
  })

  it('accepts a function as count', () => {
    const result = collect([1, 2, 3]).random((c) => c.count()) as Collection<number>
    expect(result.count()).toBe(3)
  })

  it('returns Collection of count 1', () => {
    const result = collect([1, 2, 3]).random(1) as Collection<number>
    expect(result.count()).toBe(1)
  })
})
