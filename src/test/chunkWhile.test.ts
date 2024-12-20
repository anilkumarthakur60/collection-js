import { collect } from '../collect'

describe('chunkWhile', () => {
  it('The chunkWhile method splits the collection into chunks based on the predicate:', () => {
    const collection = collect([1, 2, 2, 3, 4, 4, 4, 5, 6])
    const chunks = collection.chunkWhile(
      (item: number, index: number, array: number[]) => index === 0 || item === array[index - 1]
    )
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([
      [1],
      [2, 2],
      [3],
      [4, 4, 4],
      [5],
      [6]
    ])
  })

  it('The chunkWhile method handles a collection where all items are in one chunk:', () => {
    const collection = collect([1, 1, 1, 1, 1])
    const chunks = collection.chunkWhile(
      (item: number, index: number, array: number[]) => index === 0 || item === array[index - 1]
    )
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1, 1, 1, 1, 1]])
  })

  it('The chunkWhile method handles a collection where each item is a separate chunk:', () => {
    const collection = collect([1, 2, 3, 4, 5])
    const chunks = collection.chunkWhile(() => false)
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([[1], [2], [3], [4], [5]])
  })

  it('The chunkWhile method handles an empty collection:', () => {
    const collection = collect<number>([])
    const chunks = collection.chunkWhile(() => true)
    expect(chunks.all()).toEqual([])
  })

  it('The chunkWhile method works correctly with different data types:', () => {
    const collection = collect(['a', 'b', 'b', 'c', 'd', 'd'])
    const chunks = collection.chunkWhile(
      (item: string, index: number, array: string[]) => index === 0 || item === array[index - 1]
    )
    expect(chunks.all().map((chunk) => chunk.all())).toEqual([['a'], ['b', 'b'], ['c'], ['d', 'd']])
  })
})
