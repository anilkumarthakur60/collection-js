import { collect } from '../src'

const flatten = <T>(c: { all(): { all(): T[] }[] }): T[][] => c.all().map((inner) => inner.all())

describe('split', () => {
  it('splits into 2 groups of equal size', () => {
    expect(flatten(collect([1, 2, 3, 4]).split(2))).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('splits into 3 groups', () => {
    expect(flatten(collect([1, 2, 3, 4, 5, 6]).split(3))).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ])
  })

  it('distributes the remainder across the leading groups', () => {
    expect(flatten(collect([1, 2, 3, 4, 5]).split(2))).toEqual([
      [1, 2, 3],
      [4, 5],
    ])
  })

  it('returns empty collection for empty input', () => {
    expect(flatten(collect([]).split(3))).toEqual([])
  })

  it('returns single group when groups equals 1', () => {
    expect(flatten(collect([1, 2, 3]).split(1))).toEqual([[1, 2, 3]])
  })
})

describe('splitIn', () => {
  it('splits collection into n groups', () => {
    expect(flatten(collect([1, 2, 3, 4]).splitIn(2))).toEqual([
      [1, 2],
      [3, 4],
    ])
  })

  it('fills non-terminal groups completely first', () => {
    expect(flatten(collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).splitIn(3))).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7, 8],
      [9, 10],
    ])
  })

  it('returns empty collection for empty input', () => {
    expect(flatten(collect([]).splitIn(2))).toEqual([])
  })

  it('returns single group when splitIn(1)', () => {
    expect(flatten(collect([1, 2, 3]).splitIn(1))).toEqual([[1, 2, 3]])
  })
})
