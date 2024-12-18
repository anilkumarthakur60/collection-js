import { collect } from '../collect'

describe('Collection.percentage', () => {
  it('should return the correct percentage of items passing the truth test', () => {
    const collection = collect([1, 1, 2, 2, 2, 3])

    const result = collection.percentage((value) => value === 1)
    expect(result).toBe(33.33)
  })

  it('should allow specifying precision for rounding', () => {
    const collection = collect([1, 1, 2, 2, 2, 3])

    const result = collection.percentage((value) => value === 1, 3)
    expect(result).toBe(33.333)
  })

  it('should return 0 for an empty collection', () => {
    const collection = collect<number>([])

    const result = collection.percentage(() => true)
    expect(result).toBe(0)
  })

  it('should return 0 if no items pass the truth test', () => {
    const collection = collect([1, 2, 3])

    const result = collection.percentage((value) => value === 4)
    expect(result).toBe(0)
  })

  it('should calculate percentage correctly with mixed data types', () => {
    const collection = collect([1, 'a', 2, 'b', 3, 'a'])

    const result = collection.percentage((value) => value === 'a')
    expect(result).toBe(33.33)
  })

  it('should calculate percentage when all items pass the truth test', () => {
    const collection = collect([1, 1, 1, 1])

    const result = collection.percentage((value) => value === 1)
    expect(result).toBe(100.0)
  })
})
