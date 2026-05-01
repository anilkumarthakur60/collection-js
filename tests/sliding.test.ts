import { collect } from '../src'

const flatten = <T>(c: { all(): { all(): T[] }[] }): T[][] => c.all().map((inner) => inner.all())

describe('sliding', () => {
  it('creates sliding windows of given size', () => {
    expect(flatten(collect([1, 2, 3, 4, 5]).sliding(3))).toEqual([
      [1, 2, 3],
      [2, 3, 4],
      [3, 4, 5],
    ])
  })

  it('with step of 2', () => {
    expect(flatten(collect([1, 2, 3, 4, 5]).sliding(2, 2))).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('returns single window when size equals collection length', () => {
    expect(flatten(collect([1, 2, 3]).sliding(3))).toEqual([[1, 2, 3]])
  })

  it('returns empty when size exceeds length', () => {
    expect(flatten(collect([1, 2]).sliding(5))).toEqual([])
  })

  it('returns empty for empty collection', () => {
    expect(flatten(collect([]).sliding(2))).toEqual([])
  })

  it('window of size 1 returns each item as a single-element window', () => {
    expect(flatten(collect([1, 2, 3]).sliding(1))).toEqual([[1], [2], [3]])
  })

  it('step of 1 is default', () => {
    expect(flatten(collect([1, 2, 3, 4]).sliding(2, 1))).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ])
  })
})
