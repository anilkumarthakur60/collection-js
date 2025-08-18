import { collect } from '../collect'

describe('range', () => {
  it('creates a range of numbers', () => {
    expect(collect([]).range(1, 5).all()).toEqual([1, 2, 3, 4, 5])
  })

  it('creates a range starting from 0', () => {
    expect(collect([]).range(0, 4).all()).toEqual([0, 1, 2, 3, 4])
  })

  it('returns single item range', () => {
    expect(collect([]).range(3, 3).all()).toEqual([3])
  })

  it('returns correct count', () => {
    expect(collect([]).range(1, 10).count()).toBe(10)
  })

  it('works with negative start', () => {
    expect(collect([]).range(-2, 2).all()).toEqual([-2, -1, 0, 1, 2])
  })

  it('returns all integers inclusive of start and end', () => {
    const result = collect([]).range(5, 8).all()
    expect(result[0]).toBe(5)
    expect(result[result.length - 1]).toBe(8)
  })
})
