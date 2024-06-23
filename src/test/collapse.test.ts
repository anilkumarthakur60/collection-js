import { collect } from '../collect'

describe('collapse', () => {
  it('The collapse method flattens a collection of arrays into a single, flat collection:', () => {
    const collection = collect([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]
    ])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9])
  })

  it('The collapse method handles an empty collection of arrays:', () => {
    const collection = collect<number[][]>([])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([])
  })

  it('The collapse method handles a collection with some empty arrays:', () => {
    const collection = collect([[1, 2], [], [3, 4]])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([1, 2, 3, 4])
  })

  it('The collapse method works correctly with different data types:', () => {
    const collection = collect([
      ['a', 'b'],
      ['c', 'd']
    ])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('The collapse method handles nested arrays correctly:', () => {
    const collection = collect([
      [
        [1, 2],
        [3, 4]
      ],
      [
        [5, 6],
        [7, 8]
      ]
    ])
    const collapsed = collection.collapse()
    expect(collapsed.all()).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    ])
  })
})
