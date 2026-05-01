import { collect } from '../src'

describe('chunkWhile', () => {
  it('groups consecutive equal values', () => {
    // The third parameter is the in-progress chunk (Laravel parity).
    const result = collect([1, 1, 2, 2, 3]).chunkWhile(
      (value, _i, chunk) => value === chunk[chunk.length - 1],
    )
    expect(result.count()).toBe(3)
    expect(result.all()[0].all()).toEqual([1, 1])
    expect(result.all()[1].all()).toEqual([2, 2])
    expect(result.all()[2].all()).toEqual([3])
  })

  it('groups consecutive ascending numbers', () => {
    const result = collect([1, 2, 3, 5, 6, 8]).chunkWhile(
      (value, _i, chunk) => value === chunk[chunk.length - 1] + 1,
    )
    expect(result.count()).toBe(3)
    expect(result.all()[0].all()).toEqual([1, 2, 3])
    expect(result.all()[1].all()).toEqual([5, 6])
    expect(result.all()[2].all()).toEqual([8])
  })

  it('returns empty collection for empty input', () => {
    const result = collect([]).chunkWhile(() => true)
    expect(result.count()).toBe(0)
  })

  it('returns single chunk when all items satisfy predicate', () => {
    const result = collect([1, 1, 1]).chunkWhile((v, _i, chunk) => v === chunk[chunk.length - 1])
    expect(result.count()).toBe(1)
    expect(result.all()[0].all()).toEqual([1, 1, 1])
  })

  it('returns one chunk per item when no items satisfy predicate', () => {
    const result = collect([1, 2, 3]).chunkWhile(() => false)
    expect(result.count()).toBe(3)
    expect(result.all()[0].all()).toEqual([1])
    expect(result.all()[1].all()).toEqual([2])
    expect(result.all()[2].all()).toEqual([3])
  })

  it('works with single item collection', () => {
    const result = collect([42]).chunkWhile(() => true)
    expect(result.count()).toBe(1)
    expect(result.all()[0].all()).toEqual([42])
  })
})
