import { collect } from '../src'

describe('merge', () => {
  it('appends another array onto the collection', () => {
    expect(collect([1, 2]).merge([3, 4]).all()).toEqual([1, 2, 3, 4])
  })

  it('merges another Collection', () => {
    expect(collect([1, 2]).merge(collect([3, 4])).all()).toEqual([1, 2, 3, 4])
  })

  it('merges multiple arrays', () => {
    expect(collect([1]).merge([2], [3], [4]).all()).toEqual([1, 2, 3, 4])
  })

  it('returns same items when merging empty array', () => {
    expect(collect([1, 2]).merge([]).all()).toEqual([1, 2])
  })

  it('merging into empty collection returns the merged items', () => {
    expect(collect<number>([]).merge([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('does not mutate original when reassigned', () => {
    const c = collect([1, 2])
    const merged = c.merge([3])
    expect(c.all()).toEqual([1, 2])
    expect(merged.all()).toEqual([1, 2, 3])
  })

  it('merges associative records by overwriting matching keys', () => {
    const result = collect([{ product_id: 1, price: 100 }]).merge([{ price: 200, discount: false }])
    expect(result.all()).toEqual([{ product_id: 1, price: 200, discount: false }])
  })
})

describe('mergeRecursive', () => {
  it('merges objects recursively, combining matching keys into arrays', () => {
    const result = collect([{ product_id: 1, price: 100 }])
      .mergeRecursive([{ product_id: 2, price: 200, discount: false }])
      .all()
    expect(result).toEqual([{ product_id: [1, 2], price: [100, 200], discount: false }])
  })

  it('merges arrays as concatenation', () => {
    const result = collect([{ scores: [10, 20] }]).mergeRecursive([{ scores: [30] }]).all()
    expect(result).toEqual([{ scores: [10, 20, 30] }])
  })

  it('returns original when merging empty', () => {
    expect(collect([{ a: 1 }]).mergeRecursive([]).all()).toEqual([{ a: 1 }])
  })

  it('merges with multiple sources', () => {
    const result = collect([{ x: 1 }]).mergeRecursive([{ x: 2 }], [{ x: 3 }]).all()
    expect(result).toEqual([{ x: [[1, 2], 3] }])
  })
})
