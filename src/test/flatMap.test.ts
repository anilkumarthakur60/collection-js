import { collect } from '../collect'

describe('flatMap', () => {
  it('should apply the callback to each item and flatten the result by one level', () => {
    const collection = collect([1, 2, 3])
    const flatMapped = collection.flatMap((item) => [item, item * 2])

    expect(flatMapped.toArray()).toEqual([1, 2, 2, 4, 3, 6])
  })

  it('should handle nested arrays correctly', () => {
    const collection = collect([1, 2, 3])
    const flatMapped = collection.flatMap((item) => [[item], [item * 2]])

    expect(flatMapped.toArray().flat()).toEqual([1, 2, 2, 4, 3, 6])
  })

  it('should return an empty collection when the original collection is empty', () => {
    const collection = collect([])
    const flatMapped = collection.flatMap((item) => [item, item * 2])

    expect(flatMapped.toArray()).toEqual([])
  })

  it('should work with a collection of objects', () => {
    const collection = collect([{ id: 1 }, { id: 2 }, { id: 3 }])
    const flatMapped = collection.flatMap((item) => [item, { id: item.id * 2 }])

    expect(flatMapped.toArray()).toEqual([
      { id: 1 },
      { id: 2 },
      { id: 2 },
      { id: 4 },
      { id: 3 },
      { id: 6 }
    ])
  })

  it('should work with a collection of strings', () => {
    const collection = collect(['a', 'b', 'c'])
    const flatMapped = collection.flatMap((item) => [item, item.toUpperCase()])

    expect(flatMapped.toArray()).toEqual(['a', 'A', 'b', 'B', 'c', 'C'])
  })

  it('should handle complex nested arrays correctly', () => {
    const collection = collect([1, 2, 3])
    const flatMapped = collection.flatMap((item) => [[item], [item * 2], [[item * 3]]])

    // Since we only flatten by one level, this should result in:
    expect(flatMapped.toArray().flat()).toEqual([1, 2, [3], 2, 4, [6], 3, 6, [9]])
  })

  it('should handle an array of arrays', () => {
    const collection = collect([
      [1, 2],
      [3, 4]
    ])
    const flatMapped = collection.flatMap((item) => item)

    expect(flatMapped.toArray()).toEqual([1, 2, 3, 4])
  })

  it('should work with an array of objects containing arrays', () => {
    const collection = collect([{ values: [1, 2] }, { values: [3, 4] }])
    const flatMapped = collection.flatMap((item) => item.values)

    expect(flatMapped.toArray()).toEqual([1, 2, 3, 4])
  })
})
