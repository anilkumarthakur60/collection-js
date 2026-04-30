import { collect } from '../src'

describe('median', () => {
  it('returns median of odd-length collection', () => {
    expect(collect([3, 1, 2]).median()).toBe(2)
  })

  it('returns average of two middle items for even-length', () => {
    expect(collect([1, 2, 3, 4]).median()).toBe(2.5)
  })

  it('returns single item for single-item collection', () => {
    expect(collect([42]).median()).toBe(42)
  })

  it('works with unsorted numbers', () => {
    expect(collect([5, 1, 3]).median()).toBe(3)
  })

  it('works with callback', () => {
    const items = [{ score: 10 }, { score: 30 }, { score: 20 }]
    expect(collect(items).median((v) => v.score)).toBe(20)
  })

  it('even count with callback', () => {
    const items = [{ v: 1 }, { v: 2 }, { v: 3 }, { v: 4 }]
    expect(collect(items).median((item) => item.v)).toBe(2.5)
  })

  it('works with negative numbers', () => {
    expect(collect([-3, -1, -2]).median()).toBe(-2)
  })

  it('works with duplicate values', () => {
    expect(collect([2, 2, 2]).median()).toBe(2)
  })
})
