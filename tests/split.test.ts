import { collect } from '../src'

describe('split', () => {
  it('splits into 2 groups', () => {
    const result = collect([1, 2, 3, 4]).split(2)
    expect(result.all()).toEqual([
      [1, 2],
      [3, 4]
    ])
  })

  it('splits into 3 groups', () => {
    const result = collect([1, 2, 3, 4, 5, 6]).split(3)
    expect(result.all()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
  })

  it('last group may have fewer items', () => {
    const result = collect([1, 2, 3, 4, 5]).split(2)
    expect(result.all()[0]).toEqual([1, 2, 3])
    expect(result.all()[1]).toEqual([4, 5])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).split(3).all()).toEqual([])
  })

  it('returns single group when groups equals 1', () => {
    const result = collect([1, 2, 3]).split(1)
    expect(result.all()).toEqual([[1, 2, 3]])
  })
})

describe('splitIn', () => {
  it('splits collection into n groups', () => {
    const result = collect([1, 2, 3, 4]).splitIn(2)
    expect(result.all()).toEqual([
      [1, 2],
      [3, 4]
    ])
  })

  it('handles uneven split', () => {
    const result = collect([1, 2, 3, 4, 5]).splitIn(2)
    expect(result.all()[0]).toEqual([1, 2, 3])
    expect(result.all()[1]).toEqual([4, 5])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).splitIn(2).all()).toEqual([])
  })

  it('returns single group when splitIn(1)', () => {
    expect(collect([1, 2, 3]).splitIn(1).all()).toEqual([[1, 2, 3]])
  })
})
