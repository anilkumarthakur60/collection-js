import { collect, Collection } from '../src'

describe('pop', () => {
  it('removes and returns the last item', () => {
    const c = collect([1, 2, 3])
    expect(c.pop()).toBe(3)
    expect(c.all()).toEqual([1, 2])
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).pop()).toBeUndefined()
  })

  it('pops multiple items as a Collection', () => {
    const c = collect([1, 2, 3, 4, 5])
    const popped = c.pop(2)
    expect(popped).toBeInstanceOf(Collection)
    expect((popped as Collection<number>).all()).toEqual([5, 4])
    expect(c.all()).toEqual([1, 2, 3])
  })

  it('pops single item when count is 1', () => {
    const c = collect([1, 2, 3])
    const result = c.pop(1)
    expect((result as Collection<number>).all()).toEqual([3])
    expect(c.all()).toEqual([1, 2])
  })
})

describe('shift', () => {
  it('removes and returns the first item', () => {
    const c = collect([1, 2, 3])
    expect(c.shift()).toBe(1)
    expect(c.all()).toEqual([2, 3])
  })

  it('returns undefined for empty collection', () => {
    expect(collect([]).shift()).toBeUndefined()
  })

  it('shifts multiple items as a Collection', () => {
    const c = collect([1, 2, 3, 4, 5])
    const shifted = c.shift(2)
    expect(shifted).toBeInstanceOf(Collection)
    expect((shifted as Collection<number>).all()).toEqual([1, 2])
    expect(c.all()).toEqual([3, 4, 5])
  })

  it('shifts single item when count is 1', () => {
    const c = collect([10, 20, 30])
    const result = c.shift(1)
    expect((result as Collection<number>).all()).toEqual([10])
    expect(c.all()).toEqual([20, 30])
  })
})
