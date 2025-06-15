import { collect } from '../collect'

describe('nth', () => {
  it('should return the nth item in the collection', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.nth(2)).toEqual(3)
  })

  it('should return undefined for an out-of-bounds index', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.nth(10)).toBeUndefined()
  })

  it('should return the first item when n is 0', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.nth(0)).toEqual(1)
  })

  it('should return the last item when n is negative and within bounds', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.nth(-1)).toEqual(5)
  })

  it('should return undefined when n is negative and out of bounds', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.nth(-6)).toBeUndefined()
  })

  it('should handle an empty collection gracefully', () => {
    const collection = collect([])
    expect(collection.nth(0)).toBeUndefined()
  })

  it('should return the correct item for a collection of objects', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    expect(collection.nth(1)).toEqual({ id: 2 })
  })
})
