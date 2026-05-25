import { collect } from '../src'

describe('percentage', () => {
  it('calculates percentage with default precision of 2', () => {
    expect(collect([1, 1, 2, 2, 2, 3]).percentage((v) => v === 1)).toBe(33.33)
  })

  it('calculates percentage with custom precision', () => {
    expect(collect([1, 1, 2, 2, 2, 3]).percentage((v) => v === 1, 3)).toBe(33.333)
  })

  it('returns 100 when all match', () => {
    expect(collect([1, 1, 1]).percentage((v) => v === 1)).toBe(100)
  })

  it('returns 0 when none match', () => {
    expect(collect([1, 2, 3]).percentage((v) => v > 10)).toBe(0)
  })

  it('returns 0 for empty collection', () => {
    expect(collect([]).percentage(() => true)).toBe(0)
  })

  it('calculates 50%', () => {
    expect(collect([1, 2, 3, 4]).percentage((v) => v % 2 === 0)).toBe(50)
  })

  it('calculates with precision 0', () => {
    expect(collect([1, 2, 3]).percentage((v) => v === 1, 0)).toBe(33)
  })

  it('calculates exact percentage', () => {
    expect(collect([1, 2, 3, 4, 5]).percentage((v) => v <= 2)).toBe(40)
  })
})
