import { collect } from '../collect'

describe('diff method', () => {
  it('The diff method returns the values in the original collection that are not present in the given array', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const result = collection.diff([2, 4, 6])
    expect(result).toEqual(collect([1, 3, 5]))
  })

  it('The diff method returns the values in the original collection that are not present in the given collection', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const otherCollection = collect([2, 4, 6])
    const result = collection.diff(otherCollection)
    expect(result).toEqual(collect([1, 3, 5]))
  })

  it('The diff method works with strings', () => {
    const collection = collect(['apple', 'banana', 'cherry'])
    const result = collection.diff(['banana', 'date'])
    expect(result).toEqual(collect(['apple', 'cherry']))
  })

  it('The diff method works with complex objects', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const otherCollection = collect([{ id: 2 }])
    const result = collection.diff(otherCollection)
    expect(result).toEqual(collect([{ id: 1 }, { id: 3 }]))
  })

  it('The diff method returns an empty collection if all items are present in the given array', () => {
    const collection = collect([1, 2, 3])
    const result = collection.diff([1, 2, 3, 4])
    expect(result).toEqual(collect([]))
  })

  it('The diff method returns the original collection if no items are present in the given array', () => {
    const collection = collect([1, 2, 3])
    const result = collection.diff([4, 5, 6])
    expect(result).toEqual(collection)
  })
})
