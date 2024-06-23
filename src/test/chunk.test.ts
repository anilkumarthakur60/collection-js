import { collect } from '../collect'

describe('chunk', () => {
  it('The chunk method splits the collection into chunks of the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const chunks = collection.chunk(2)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1, 2], [3, 4], [5]])
  })

  it('The chunk method handles cases where the last chunk is smaller than the specified size:', () => {
    const collection = collect([1, 2, 3, 4, 5, 6, 7])
    const chunks = collection.chunk(3)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1, 2, 3], [4, 5, 6], [7]])
  })

  it('The chunk method returns an empty collection when the size is zero or negative:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    expect(collection.chunk(0).all()).toEqual([])
    expect(collection.chunk(-1).all()).toEqual([])
  })

  it('The chunk method works correctly with different data types:', () => {
    const collection = collect(['a', 'b', 'c', 'd'])
    const chunks = collection.chunk(2)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([
      ['a', 'b'],
      ['c', 'd']
    ])
  })

  it('The chunk method handles an empty collection correctly:', () => {
    const collection = collect([])
    expect(collection.chunk(2).all()).toEqual([])
  })
})
