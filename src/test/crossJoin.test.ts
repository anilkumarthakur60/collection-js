import { collect } from '../collect'

describe('crossJoin', () => {
  it('The crossJoin method works with two arrays:', () => {
    const collection = collect([1, 2])
    const result = collection.crossJoin(['a', 'b'])
    expect(result.all()).toEqual([
      [1, 'a'],
      [1, 'b'],
      [2, 'a'],
      [2, 'b']
    ])
  })

  it('The crossJoin method works with three arrays:', () => {
    const collection = collect([1, 2])
    const result = collection.crossJoin(['a', 'b'], ['x', 'y'])
    expect(result.all()).toEqual([
      [1, 'a', 'x'],
      [1, 'a', 'y'],
      [1, 'b', 'x'],
      [1, 'b', 'y'],
      [2, 'a', 'x'],
      [2, 'a', 'y'],
      [2, 'b', 'x'],
      [2, 'b', 'y']
    ])
  })

  it('The crossJoin method works with single element arrays:', () => {
    const collection = collect([1])
    const result = collection.crossJoin(['a'])
    expect(result.all()).toEqual([[1, 'a']])
  })

  it('The crossJoin method works with multiple arrays of different lengths:', () => {
    const collection = collect([1, 2, 3])
    const result = collection.crossJoin(['a'], ['x', 'y', 'z'])
    expect(result.all()).toEqual([
      [1, 'a', 'x'],
      [1, 'a', 'y'],
      [1, 'a', 'z'],
      [2, 'a', 'x'],
      [2, 'a', 'y'],
      [2, 'a', 'z'],
      [3, 'a', 'x'],
      [3, 'a', 'y'],
      [3, 'a', 'z']
    ])
  })

  it('The crossJoin method returns an empty array if the original collection is empty:', () => {
    const collection = collect([])
    const result = collection.crossJoin(['a', 'b'])
    expect(result.all()).toEqual([])
  })

  it('The crossJoin method returns the original items if no additional arrays are provided:', () => {
    const collection = collect([1, 2])
    const result = collection.crossJoin()
    expect(result.all()).toEqual([[1], [2]])
  })
})
