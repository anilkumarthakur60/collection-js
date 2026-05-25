import { collect } from '../src'

describe('splice', () => {
  it('removes items from start to end and returns the removed items (Laravel parity)', () => {
    const c = collect([1, 2, 3, 4, 5])
    const removed = c.splice(2)
    expect(removed.all()).toEqual([3, 4, 5])
    expect(c.all()).toEqual([1, 2])
  })

  it('removes a specified number of items', () => {
    const c = collect([1, 2, 3, 4, 5])
    const removed = c.splice(1, 2)
    expect(removed.all()).toEqual([2, 3])
    expect(c.all()).toEqual([1, 4, 5])
  })

  it('inserts items at position', () => {
    const c = collect([1, 2, 5])
    const removed = c.splice(2, 0, 3, 4)
    expect(removed.all()).toEqual([])
    expect(c.all()).toEqual([1, 2, 3, 4, 5])
  })

  it('replaces items', () => {
    const c = collect([1, 2, 3])
    const removed = c.splice(1, 1, 99)
    expect(removed.all()).toEqual([2])
    expect(c.all()).toEqual([1, 99, 3])
  })

  it('mutates the source collection (Laravel parity)', () => {
    const c = collect([1, 2, 3])
    c.splice(1, 1)
    expect(c.all()).toEqual([1, 3])
  })

  it('works at index 0', () => {
    const c = collect([1, 2, 3])
    const removed = c.splice(0, 1)
    expect(removed.all()).toEqual([1])
    expect(c.all()).toEqual([2, 3])
  })

  it('returns empty for empty collection', () => {
    expect(collect<number>([]).splice(0).all()).toEqual([])
  })

  it('splice with start beyond length removes nothing', () => {
    const c = collect([1, 2, 3])
    const removed = c.splice(10)
    expect(removed.all()).toEqual([])
    expect(c.all()).toEqual([1, 2, 3])
  })
})
