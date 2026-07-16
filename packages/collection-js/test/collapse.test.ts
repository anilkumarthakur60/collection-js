import { collect } from '../src'

describe('collapse', () => {
  it('collapses nested arrays into a single flat collection', () => {
    expect(
      collect<number | readonly number[]>([[1, 2], [3, 4], [5]])
        .collapse()
        .all()
    ).toEqual([1, 2, 3, 4, 5])
  })

  it('returns empty collection for empty input', () => {
    expect(collect<number | readonly number[]>([]).collapse().all()).toEqual([])
  })

  it('handles already flat items (non-arrays)', () => {
    expect(collect<number | readonly number[]>([1, 2, 3]).collapse().all()).toEqual([1, 2, 3])
  })

  it('collapses arrays of strings', () => {
    expect(
      collect<string | readonly string[]>([
        ['a', 'b'],
        ['c', 'd']
      ])
        .collapse()
        .all()
    ).toEqual(['a', 'b', 'c', 'd'])
  })

  it('collapses single array', () => {
    expect(
      collect<number | readonly number[]>([[1, 2, 3]])
        .collapse()
        .all()
    ).toEqual([1, 2, 3])
  })

  it('collapses arrays of objects', () => {
    const items = [[{ id: 1 }, { id: 2 }], [{ id: 3 }]]
    expect(collect<{ id: number } | ReadonlyArray<{ id: number }>>(items).collapse().all()).toEqual(
      [{ id: 1 }, { id: 2 }, { id: 3 }]
    )
  })

  it('handles empty inner arrays', () => {
    expect(
      collect<number | readonly number[]>([[], [1, 2], []])
        .collapse()
        .all()
    ).toEqual([1, 2])
  })

  it('collapses three nested arrays', () => {
    expect(
      collect<number | readonly number[]>([[1], [2], [3]])
        .collapse()
        .all()
    ).toEqual([1, 2, 3])
  })
})
