import { collect } from '../collect'

describe('min', () => {
  it('should return the smallest number in the collection', () => {
    const collection = collect([3, 1, 4, 1, 5, 9])
    expect(collection.min()).toEqual(1)
  })

  it('should return the smallest string in the collection', () => {
    const collection = collect(['apple', 'banana', 'cherry'])
    expect(collection.min()).toEqual('apple')
  })

  it('should return undefined for an empty collection', () => {
    const collection = collect([])
    expect(collection.min()).toBeUndefined()
  })

  it('should return the smallest object based on a callback', () => {
    const collection = collect([{ id: 3 }, { id: 1 }, { id: 4 }])
    expect(collection.min((item) => item.id)).toEqual({ id: 1 })
  })
})
