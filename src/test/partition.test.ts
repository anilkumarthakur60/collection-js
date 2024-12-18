import { collect } from '../collect'

describe('Collection.partition', () => {
  it('should separate elements based on the given truth test', () => {
    const collection = collect([1, 2, 3, 4, 5, 6])

    const [underThree, equalOrAboveThree] = collection.partition((item) => item < 3)

    expect(underThree.all()).toEqual([1, 2])
    expect(equalOrAboveThree.all()).toEqual([3, 4, 5, 6])
  })

  it('should handle empty collections', () => {
    const collection = collect<number>([])

    const [truthy, falsy] = collection.partition((item) => item < 3)

    expect(truthy.all()).toEqual([])
    expect(falsy.all()).toEqual([])
  })

  it('should work with mixed data types', () => {
    const collection = collect([1, '2', 3, '4', 5])

    const [numbers, strings] = collection.partition((item) => typeof item === 'number')

    expect(numbers.all()).toEqual([1, 3, 5])
    expect(strings.all()).toEqual(['2', '4'])
  })

  it('should consider the index in the callback function', () => {
    const collection = collect([10, 20, 30, 40, 50])

    const [evenIndices, oddIndices] = collection.partition((_, index) => index % 2 === 0)

    expect(evenIndices.all()).toEqual([10, 30, 50])
    expect(oddIndices.all()).toEqual([20, 40])
  })
})
