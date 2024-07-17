import { collect } from '../collect'
import { ItemNotFoundException } from '../exceptions/ItemNotFoundException'

describe('firstOrFail', () => {
  it('should return the first item in the collection when no predicate is provided', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const firstItem = collection.firstOrFail()

    expect(firstItem).toBe(1)
  })

  it('should throw an ItemNotFoundException if the collection is empty and no predicate is provided', () => {
    const collection = collect([])

    expect(() => collection.firstOrFail()).toThrow(ItemNotFoundException)
  })

  it('should return the first item that matches the predicate', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const firstItem = collection.firstOrFail((item) => item > 3)

    expect(firstItem).toBe(4)
  })

  it('should throw an ItemNotFoundException if no items match the predicate', () => {
    const collection = collect([1, 2, 3])

    expect(() => collection.firstOrFail((item) => item > 5)).toThrow(ItemNotFoundException)
  })

  it('should work with a collection of objects', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const firstItem = collection.firstOrFail((item) => item.id === 2)

    expect(firstItem).toEqual({ id: 2 })
  })

  it('should throw an ItemNotFoundException if no objects match the predicate', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])

    expect(() => collection.firstOrFail((item) => item.id === 4)).toThrow(ItemNotFoundException)
  })

  it('should work with a collection of strings', () => {
    const collection = collect(['a', 'b', 'c'])
    const firstItem = collection.firstOrFail((item) => item === 'b')

    expect(firstItem).toBe('b')
  })

  it('should throw an ItemNotFoundException if no strings match the predicate', () => {
    const collection = collect(['a', 'b', 'c'])

    expect(() => collection.firstOrFail((item) => item === 'd')).toThrow(ItemNotFoundException)
  })

  it('should throw an ItemNotFoundException if the collection is empty and a predicate is provided', () => {
    const collection = collect([])

    expect(() => collection.firstOrFail((item) => item === 1)).toThrow(ItemNotFoundException)
  })
})
