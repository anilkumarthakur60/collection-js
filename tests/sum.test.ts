import { collect } from '../src'

describe('sum', () => {
  it('sums all numbers', () => {
    expect(collect([1, 2, 3, 4, 5]).sum()).toBe(15)
  })

  it('returns 0 for empty collection', () => {
    expect(collect([]).sum()).toBe(0)
  })

  it('sums with a callback', () => {
    const items = [{ price: 10 }, { price: 20 }, { price: 30 }]
    expect(collect(items).sum((v) => v.price)).toBe(60)
  })

  it('sums by key', () => {
    const items = [{ quantity: 2 }, { quantity: 3 }, { quantity: 5 }]
    expect(collect(items).sum('quantity')).toBe(10)
  })

  it('returns 0 for single zero item', () => {
    expect(collect([0]).sum()).toBe(0)
  })

  it('handles negative numbers', () => {
    expect(collect([-1, -2, -3]).sum()).toBe(-6)
  })

  it('sums mixed positives and negatives', () => {
    expect(collect([5, -3, 2]).sum()).toBe(4)
  })

  it('sums floats', () => {
    expect(collect([1.5, 2.5]).sum()).toBeCloseTo(4)
  })
})
