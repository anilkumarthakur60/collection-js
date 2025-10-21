import { collect } from '../src/collect'

describe('average / avg', () => {
  it('calculates average of numbers', () => {
    expect(collect([1, 2, 3, 4, 5]).average()).toBe(3)
  })

  it('returns 0 for empty collection', () => {
    expect(collect([]).average()).toBe(0)
  })

  it('calculates average with callback', () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }]
    expect(collect(items).average((item) => item.price)).toBe(20)
  })

  it('calculates average of single item', () => {
    expect(collect([42]).average()).toBe(42)
  })

  it('calculates average with decimal result', () => {
    expect(collect([1, 2]).average()).toBe(1.5)
  })

  it('avg is an alias for average', () => {
    expect(collect([1, 2, 3]).avg()).toBe(2)
  })

  it('avg with callback', () => {
    const items = [{ score: 100 }, { score: 200 }]
    expect(collect(items).avg((item) => item.score)).toBe(150)
  })

  it('handles negative numbers', () => {
    expect(collect([-3, -1, 2]).average()).toBeCloseTo(-0.667, 2)
  })

  it('avg returns 0 for empty collection', () => {
    expect(collect([]).avg()).toBe(0)
  })

  it('calculates average of floats', () => {
    expect(collect([1.5, 2.5, 3.0]).average()).toBeCloseTo(2.333, 2)
  })
})
