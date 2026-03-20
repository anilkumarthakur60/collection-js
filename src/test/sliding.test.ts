import { collect } from '../collect'

describe('sliding', () => {
  it('creates sliding windows of given size', () => {
    const result = collect([1, 2, 3, 4, 5]).sliding(3)
    expect(result.all()).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5]
    ])
  })

  it('with step of 2', () => {
    const result = collect([1, 2, 3, 4, 5]).sliding(2, 2)
    expect(result.all()).toEqual([
      [1, 2],
      [3, 4]
    ])
  })

  it('returns single window when size equals collection length', () => {
    const result = collect([1, 2, 3]).sliding(3)
    expect(result.all()).toEqual([[1, 2, 3]])
  })

  it('returns empty when size exceeds length', () => {
    const result = collect([1, 2]).sliding(5)
    expect(result.all()).toEqual([])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).sliding(2).all()).toEqual([])
  })

  it('window of size 1 returns each item as array', () => {
    const result = collect([1, 2, 3]).sliding(1)
    expect(result.all()).toEqual([[1], [2], [3]])
  })

  it('step of 1 is default', () => {
    const result = collect([1, 2, 3, 4]).sliding(2, 1)
    expect(result.all()).toEqual([
      [1, 2],
      [2, 3],
      [3, 4]
    ])
  })
})
