import { collect } from '../collect'

describe('flatMap', () => {
  it('maps and flattens one level', () => {
    expect(
      collect([1, 2, 3])
        .flatMap((v) => [v, v * 2])
        .all()
    ).toEqual([1, 2, 2, 4, 3, 6])
  })

  it('returns empty for empty collection', () => {
    expect(
      collect([])
        .flatMap((v: number) => [v])
        .all()
    ).toEqual([])
  })

  it('can return empty arrays to filter items', () => {
    expect(
      collect([1, 2, 3])
        .flatMap((v) => (v > 1 ? [v] : []))
        .all()
    ).toEqual([2, 3])
  })

  it('works with strings', () => {
    expect(
      collect(['hello', 'world'])
        .flatMap((v) => v.split(''))
        .all()
    ).toEqual(['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd'])
  })

  it('maps objects to arrays', () => {
    const items = [{ values: [1, 2] }, { values: [3, 4] }]
    expect(
      collect(items)
        .flatMap((v) => v.values)
        .all()
    ).toEqual([1, 2, 3, 4])
  })
})

describe('flatten', () => {
  it('flattens one level by default', () => {
    expect(
      collect([
        [1, 2],
        [3, [4, 5]]
      ])
        .flatten(1)
        .all()
    ).toEqual([1, 2, 3, [4, 5]])
  })

  it('flattens all levels with Infinity', () => {
    expect(
      collect([[1, [2, [3]]]])
        .flatten()
        .all()
    ).toEqual([1, 2, 3])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).flatten().all()).toEqual([])
  })

  it('does not flatten non-array items', () => {
    expect(
      collect([1, 2, 3] as unknown as number[][])
        .flatten()
        .all()
    ).toEqual([1, 2, 3])
  })

  it('flattens two levels', () => {
    expect(
      collect([[[1, 2]], [[3, 4]]])
        .flatten(2)
        .all()
    ).toEqual([1, 2, 3, 4])
  })

  it('stops flattening at depth 0', () => {
    expect(
      collect([[1, 2]])
        .flatten(0)
        .all()
    ).toEqual([[1, 2]])
  })
})
