import { collect } from '../collect'

describe('max', () => {
  it('returns the maximum number', () => {
    expect(collect([1, 5, 3, 2, 4]).max()).toBe(5)
  })

  it('works with a callback', () => {
    const items = [{ value: 10 }, { value: 30 }, { value: 20 }]
    expect(collect(items).max((v) => v.value)).toBe(30)
  })

  it('works with a key', () => {
    const items = [{ price: 100 }, { price: 300 }, { price: 200 }]
    expect(collect(items).max('price')).toBe(300)
  })

  it('works with negative numbers', () => {
    expect(collect([-5, -1, -3]).max()).toBe(-1)
  })

  it('returns the single item for single-item collection', () => {
    expect(collect([42]).max()).toBe(42)
  })

  it('works with floats', () => {
    expect(collect([1.1, 2.5, 1.9]).max()).toBe(2.5)
  })
})

describe('min', () => {
  it('returns the minimum number', () => {
    expect(collect([3, 1, 4, 1, 5]).min()).toBe(1)
  })

  it('returns the minimum item with callback', () => {
    const items = [{ value: 10 }, { value: 5 }, { value: 20 }]
    const result = collect(items).min((v) => v.value)
    expect(result).toEqual({ value: 5 })
  })

  it('works with key', () => {
    const items = [{ price: 100 }, { price: 50 }, { price: 200 }]
    expect(collect(items).min('price')).toBe(50)
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).min()).toBeUndefined()
  })

  it('works with negative numbers', () => {
    expect(collect([-1, -5, -3]).min()).toBe(-5)
  })
})
