import { collect } from '../collect'
describe('Collection', () => {
  describe('mapSpread', () => {
    it('should correctly map items by spreading array elements as arguments to the callback', () => {
      const collection = collect([
        [1, 2],
        [3, 4]
      ])
      const result = collection.mapSpread((a, b) => a + b)
      expect(result.all()).toEqual([3, 7])
    })

    it('should return an empty array when the collection is empty', () => {
      const collection = collect([])
      const result = collection.mapSpread((a, b) => a + b)
      expect(result.all()).toEqual([])
    })
  })

  describe('eachSpread', () => {
    it('should correctly call the callback for each item by spreading array elements as arguments', () => {
      const collection = collect([
        [1, 2],
        [3, 4]
      ])
      const mockCallback = jest.fn()
      collection.eachSpread(mockCallback)
      expect(mockCallback).toHaveBeenCalledTimes(2)
      expect(mockCallback).toHaveBeenCalledWith(1, 2)
      expect(mockCallback).toHaveBeenCalledWith(3, 4)
    })

    it('should not call the callback when the collection is empty', () => {
      const collection = collect<number[][]>([])
      const mockCallback = jest.fn()
      collection.eachSpread(mockCallback)
      expect(mockCallback).not.toHaveBeenCalled()
    })
  })
})






describe('collect', () => {
  it('The collect method returns a new Collection instance with the items currently in the collection:', () => {
    const original = collect([1, 2, 3, 4, 5])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([1, 2, 3, 4, 5])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })

  it('The collect method works correctly with an empty collection:', () => {
    const original = collect<number>([])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })

  it('The collect method works correctly with different data types:', () => {
    const original = collect(['a', 'b', 'c'])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual(['a', 'b', 'c'])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })

  it('The collect method works correctly with nested arrays:', () => {
    const original = collect([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6]
    ])
    expect(newCollection).not.toBe(original) // Ensure it's a new instance
  })
})
