import { collect } from '../src/collect'

describe('chunk', () => {
  it('breaks collection into chunks of given size', () => {
    const result = collect([1, 2, 3, 4, 5]).chunk(2)
    expect(result.count()).toBe(3)
    expect(result.all()[0].all()).toEqual([1, 2])
    expect(result.all()[1].all()).toEqual([3, 4])
    expect(result.all()[2].all()).toEqual([5])
  })

  it('returns single chunk when size equals length', () => {
    const result = collect([1, 2, 3]).chunk(3)
    expect(result.count()).toBe(1)
    expect(result.all()[0].all()).toEqual([1, 2, 3])
  })

  it('returns empty collection when size is 0', () => {
    expect(collect([1, 2, 3]).chunk(0).count()).toBe(0)
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).chunk(2).count()).toBe(0)
  })

  it('returns one chunk per item when size is 1', () => {
    const result = collect([1, 2, 3]).chunk(1)
    expect(result.count()).toBe(3)
    expect(result.all()[0].all()).toEqual([1])
    expect(result.all()[1].all()).toEqual([2])
    expect(result.all()[2].all()).toEqual([3])
  })

  it('returns single chunk when size is larger than collection', () => {
    const result = collect([1, 2, 3]).chunk(10)
    expect(result.count()).toBe(1)
    expect(result.all()[0].all()).toEqual([1, 2, 3])
  })

  it('chunks strings', () => {
    const result = collect(['a', 'b', 'c', 'd']).chunk(2)
    expect(result.all()[0].all()).toEqual(['a', 'b'])
    expect(result.all()[1].all()).toEqual(['c', 'd'])
  })

  it('returns negative size as empty collection', () => {
    expect(collect([1, 2, 3]).chunk(-1).count()).toBe(0)
  })
})
