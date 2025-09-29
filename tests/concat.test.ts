import { collect } from '../src/collect'

describe('concat', () => {
  it('appends an array to the collection', () => {
    expect(collect([1, 2]).concat([3, 4]).all()).toEqual([1, 2, 3, 4])
  })

  it('appends another Collection', () => {
    expect(
      collect([1, 2])
        .concat(collect([3, 4]))
        .all()
    ).toEqual([1, 2, 3, 4])
  })

  it('returns same items when appending empty array', () => {
    expect(collect([1, 2, 3]).concat([]).all()).toEqual([1, 2, 3])
  })

  it('appending to empty collection returns the items', () => {
    expect(collect([]).concat([1, 2, 3]).all()).toEqual([1, 2, 3])
  })

  it('works with strings', () => {
    expect(collect(['a', 'b']).concat(['c', 'd']).all()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('does not mutate the original collection', () => {
    const original = collect([1, 2])
    const result = original.concat([3])
    expect(original.all()).toEqual([1, 2])
    expect(result.all()).toEqual([1, 2, 3])
  })

  it('can concat mixed types', () => {
    const result = collect<number | string>([1, 2]).concat(['a', 'b'])
    expect(result.all()).toEqual([1, 2, 'a', 'b'])
  })

  it('works with objects', () => {
    const result = collect([{ id: 1 }]).concat([{ id: 2 }])
    expect(result.all()).toEqual([{ id: 1 }, { id: 2 }])
  })
})
