import { collect } from '../collect'

describe('merge', () => {
  it('merges another array into the collection', () => {
    expect(collect([1, 2]).merge([3, 4]).all()).toEqual([1, 2, 3, 4])
  })

  it('merges another Collection', () => {
    expect(
      collect([1, 2])
        .merge(collect([3, 4]))
        .all()
    ).toEqual([1, 2, 3, 4])
  })

  it('merges multiple arrays', () => {
    expect(collect([1]).merge([2], [3], [4]).all()).toEqual([1, 2, 3, 4])
  })

  it('returns same items when merging empty array', () => {
    expect(collect([1, 2]).merge([]).all()).toEqual([1, 2])
  })

  it('merging into empty collection returns the merged items', () => {
    expect(collect([]).merge([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('does not mutate original collection', () => {
    const c = collect([1, 2])
    c.merge([3])
    expect(c.all()).toEqual([1, 2])
  })
})

describe('mergeRecursive', () => {
  it('merges arrays recursively', () => {
    const result = collect([1, 2]).mergeRecursive([3, 4]).all()
    expect(result).toEqual([1, 2, 3, 4])
  })

  it('merges objects recursively', () => {
    const a = [{ name: 'Alice', scores: [10] }]
    const b = [{ name: 'Bob', scores: [20] }]
    const result = collect(a).mergeRecursive(b).all()
    expect(result[0]).toHaveProperty('name', 'Bob')
    expect(result[0]).toHaveProperty('scores')
  })

  it('merges empty array', () => {
    expect(collect([1, 2]).mergeRecursive([]).all()).toEqual([1, 2])
  })

  it('merges with multiple arrays', () => {
    const result = collect([1]).mergeRecursive([2], [3]).all()
    expect(result).toEqual([1, 2, 3])
  })
})
