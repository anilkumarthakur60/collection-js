import { collect } from '../collect' // Adjust this import based on your setup

describe('Collection.pad', () => {
  it('should pad the collection to the right with the given value when size is greater than the current length', () => {
    const collection = collect(['A', 'B', 'C'])
    const padded = collection.pad(5, 0)

    expect(padded.all()).toEqual(['A', 'B', 'C', 0, 0])
  })

  it('should pad the collection to the left with the given value when size is negative and its absolute value is greater than the current length', () => {
    const collection = collect(['A', 'B', 'C'])
    const padded = collection.pad(-5, 0)

    expect(padded.all()).toEqual([0, 0, 'A', 'B', 'C'])
  })

  it('should not pad the collection if the absolute value of the size is less than or equal to the current length', () => {
    const collection = collect(['A', 'B', 'C'])

    // Positive size, no padding needed
    const padded1 = collection.pad(3, 0)
    expect(padded1.all()).toEqual(['A', 'B', 'C'])

    // Negative size, no padding needed
    const padded2 = collection.pad(-3, 0)
    expect(padded2.all()).toEqual(['A', 'B', 'C'])
  })

  it('should handle an empty collection and pad it with the given value', () => {
    const collection = collect([])
    const padded = collection.pad(3, 'X')

    expect(padded.all()).toEqual(['X', 'X', 'X'])
  })

  it('should handle an empty collection and pad to the left with the given value', () => {
    const collection = collect([])
    const padded = collection.pad(-3, 'X')

    expect(padded.all()).toEqual(['X', 'X', 'X'])
  })

  it('should handle primitive and non-primitive values as the padding value', () => {
    const collection = collect([1, 2])
    const padded1 = collection.pad(4, null)
    const padded2 = collection.pad(-5, { name: 'pad' })

    expect(padded1.all()).toEqual([1, 2, null, null])
    expect(padded2.all()).toEqual([{ name: 'pad' }, { name: 'pad' }, { name: 'pad' }, 1, 2])
  })

  it('should return a new collection and leave the original collection unchanged', () => {
    const original = collect(['A', 'B'])
    const padded = original.pad(4, 'Z')

    expect(padded.all()).toEqual(['A', 'B', 'Z', 'Z'])
    expect(original.all()).toEqual(['A', 'B']) // Original collection remains unchanged
  })
})
