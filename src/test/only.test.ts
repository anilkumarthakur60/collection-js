import { collect } from '../collect'

describe('only', () => {
  it('should return a collection of items for the given keys', () => {
    const collection = collect([
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 }
    ])
    expect(collection.only(['a', 'b']).toArray()).toEqual([
      { a: 1, b: 2 },
      { a: 4, b: 5 }
    ])
  })

  it('should return an empty collection when no keys are provided', () => {
    const collection = collect([
      { a: 1, b: 2 },
      { a: 3, b: 4 }
    ])
    expect(collection.only([]).toArray()).toEqual([{}, {}])
  })

  it('should return a collection with only the specified keys', () => {
    const collection = collect([
      { a: 1, b: 2, c: 3 },
      { a: 4, b: 5, c: 6 }
    ])
    expect(collection.only(['c']).toArray()).toEqual([{ c: 3 }, { c: 6 }])
  })

  it('should handle non-existent keys gracefully', () => {
    const collection = collect([
      { a: 1, b: 2 },
      { a: 3, b: 4 }
    ])
    expect(collection.only(['c']).toArray()).toEqual([{ c: undefined }, { c: undefined }])
  })

  it('should return a collection with mixed existing and non-existing keys', () => {
    const collection = collect([
      { a: 1, b: 2 },
      { a: 3, b: 4 }
    ])
    expect(collection.only(['a', 'c']).all()).toEqual([
      { a: 1, c: undefined },
      { a: 3, c: undefined }
    ])
  })
})
