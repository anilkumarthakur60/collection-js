import { collect } from '../collect'

describe('Collection filter method', () => {
  it('should filter the collection using the given callback', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.filter((item) => item > 2).toArray()
    expect(result).toEqual([3, 4, 5])
  })

  it('should return an empty collection if no items pass the given truth test', () => {
    const collection = collect([1, 2, 3])
    const result = collection.filter((item) => item > 3).toArray()
    expect(result).toEqual([])
  })

  it('should work with an empty collection', () => {
    const collection = collect([])
    const result = collection.filter((item) => item > 0).toArray()
    expect(result).toEqual([])
  })

  it('should pass the correct index to the callback', () => {
    const collection = collect([1, 2, 3])
    const indices: number[] = []
    collection.filter((item, index) => {
      indices.push(index)
      return item > 0
    })
    expect(indices).toEqual([0, 1, 2])
  })

  it('should work with objects in the collection', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const result = collection.filter((item) => item.id > 1).toArray()
    expect(result).toEqual([{ id: 2 }, { id: 3 }])
  })

  it('should allow method chaining', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection
      .filter((item) => item > 2)
      .each((item) => item)
      .toArray()
    expect(result).toEqual([3, 4, 5])
  })
})
