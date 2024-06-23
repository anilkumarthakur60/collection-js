import { collect } from '../collect'

describe('collect', () => {
  it('The collect method returns a new Collection instance with the items currently in the collection:', () => {
    const original = collect([1, 2, 3, 4, 5])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([1, 2, 3, 4, 5])
    expect(newCollection).not.toBe(original)
  })

  it('The collect method works correctly with an empty collection:', () => {
    const original = collect<number>([])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual([])
    expect(newCollection).not.toBe(original)
  })

  it('The collect method works correctly with different data types:', () => {
    const original = collect(['a', 'b', 'c'])
    const newCollection = original.collect()
    expect(newCollection.all()).toEqual(['a', 'b', 'c'])
    expect(newCollection).not.toBe(original)
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
    expect(newCollection).not.toBe(original)
  })
})
