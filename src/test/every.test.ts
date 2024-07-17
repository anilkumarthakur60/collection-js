import { collect } from '../collect'

describe('Collection every method', () => {
  it('should verify that all elements pass the given truth test', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.every((item) => item > 0)
    expect(result).toBe(true)
  })

  it('should return false if at least one element does not pass the given truth test', () => {
    const collection = collect([1, 2, 3, 4, 0])
    const result = collection.every((item) => item > 0)
    expect(result).toBe(false)
  })

  it('should work with an empty collection', () => {
    const collection = collect([])
    const result = collection.every((item) => item > 0)
    expect(result).toBe(true) // `every` on an empty array returns true
  })

  it('should pass the correct index to the callback', () => {
    const collection = collect([1, 2, 3])
    const indices: number[] = []
    collection.every((_, index) => {
      indices.push(index)
      return true
    })
    expect(indices).toEqual([0, 1, 2])
  })

  it('should work with objects in the collection', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const result = collection.every((item) => item.id > 0)
    expect(result).toBe(true)
  })
  it('should allow method chaining with other methods', () => {
    const collection = collect([1, 2, 3])
    const result = collection.each((item) => item).every((item) => item > 0)
    expect(result).toBe(true)
  })
})
