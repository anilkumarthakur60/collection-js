import { collect } from '../collect'

describe('forPage', () => {
  it('should return a collection of items for the given page and perPage', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(collection.forPage(2, 3)).toEqual([4, 5, 6])
  })

  it('should return an empty collection if the page is out of bounds', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(collection.forPage(3, 3)).toEqual([])
  })

  it('should return the first page when perPage is greater than the collection size', () => {
    const collection = collect([1, 2, 3])
    expect(collection.forPage(1, 10)).toEqual([1, 2, 3])
  })

  it('should return the last item when requesting the last page with one item', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.forPage(3, 1)).toEqual([5])
  })

  it('should return an empty collection when the page is zero', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.forPage(0, 2)).toEqual([])
  })

  it('should return an empty collection when perPage is zero', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.forPage(1, 0)).toEqual([])
  })

  it('should handle a large collection and return the correct items', () => {
    const collection = collect(Array.from({ length: 100 }, (_, i) => i + 1))
    expect(collection.forPage(10, 10)).toEqual([91, 92, 93, 94, 95, 96, 97, 98, 99, 100])
  })
})
