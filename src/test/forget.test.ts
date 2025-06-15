import { collect } from '../collect'

describe('forget', () => {
  it('should remove the item at the given index', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(2)
    expect(result).toEqual([1, 2, 4, 5])
  })

  it('should handle removing the first item', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(0)
    expect(result).toEqual([2, 3, 4, 5])
  })

  it('should handle removing the last item', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(4)
    expect(result).toEqual([1, 2, 3, 4])
  })

  it('should return the same collection if the index is out of bounds', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.forget(10)
    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should handle an empty collection', () => {
    const collection = collect([])
    const result = collection.forget(0)
    expect(result).toEqual([])
  })

  it('should handle removing an item from a collection of objects', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const result = collection.forget(1)
    expect(result).toEqual([{ id: 1 }, { id: 3 }])
  })
})
