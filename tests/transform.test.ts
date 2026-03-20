import { collect } from '../src/collect'

describe('transform', () => {
  it('mutates items in place', () => {
    const c = collect([1, 2, 3])
    c.transform((v) => v * 2)
    expect(c.all()).toEqual([2, 4, 6])
  })

  it('returns the collection for chaining', () => {
    const c = collect([1, 2, 3])
    const returned = c.transform((v) => v)
    expect(returned).toBe(c)
  })

  it('provides index to callback', () => {
    const c = collect(['a', 'b', 'c'])
    c.transform((v, i) => `${i}:${v}`)
    expect(c.all()).toEqual(['0:a', '1:b', '2:c'])
  })

  it('handles empty collection', () => {
    const c = collect<number>([])
    c.transform((v) => v * 2)
    expect(c.all()).toEqual([])
  })

  it('works with objects', () => {
    const c = collect([{ value: 1 }, { value: 2 }])
    c.transform((v) => ({ value: v.value * 10 }))
    expect(c.all()).toEqual([{ value: 10 }, { value: 20 }])
  })

  it('can change string values', () => {
    const c = collect(['hello', 'world'])
    c.transform((v) => v.toUpperCase())
    expect(c.all()).toEqual(['HELLO', 'WORLD'])
  })
})
