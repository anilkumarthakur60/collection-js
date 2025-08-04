import { collect } from '../collect'

describe('mode', () => {
  it('should return the most frequently occurring item in the collection', () => {
    const collection = collect([1, 2, 2, 3, 3, 3, 4, 4, 4, 4])
    expect(collection.mode()).toEqual(4)
  })

  it('should return the first item when there are multiple modes', () => {
    const collection = collect([1, 1, 2, 2, 3, 3, 4, 4])
    expect(collection.mode()).toEqual(1)
  })

  it('should return undefined for an empty collection', () => {
    const collection = collect([])
    expect(collection.mode()).toBeUndefined()
  })

  it('should return the only item in a single-item collection', () => {
    const collection = collect([1])
    expect(collection.mode()).toEqual(1)
  })

  it('should return the correct mode for a collection of objects', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }])
    expect(collection.mode()).toEqual({ id: 2 })
  })

  it('should return the correct mode using a callback', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }])
    expect(collection.mode((item) => item.id)).toEqual({ id: 2 })
  })
})
