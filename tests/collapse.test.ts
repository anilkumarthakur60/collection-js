import { collect } from '../src'

describe('collapse', () => {
  it('collapses nested arrays into a single flat collection', () => {
    expect(
      collect([[1, 2], [3, 4], [5]])
        .collapse()
        .all()
    ).toEqual([1, 2, 3, 4, 5])
  })

  it('returns empty collection for empty input', () => {
    expect(collect([]).collapse().all()).toEqual([])
  })

  it('handles already flat items (non-arrays)', () => {
    expect(
      collect([1, 2, 3] as unknown as number[][])
        .collapse()
        .all()
    ).toEqual([1, 2, 3])
  })

  it('collapses arrays of strings', () => {
    expect(
      collect([
        ['a', 'b'],
        ['c', 'd']
      ])
        .collapse()
        .all()
    ).toEqual(['a', 'b', 'c', 'd'])
  })

  it('collapses single array', () => {
    expect(
      collect([[1, 2, 3]])
        .collapse()
        .all()
    ).toEqual([1, 2, 3])
  })

  it('collapses arrays of objects', () => {
    const items = [[{ id: 1 }, { id: 2 }], [{ id: 3 }]]
    expect(collect(items).collapse().all()).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
  })

  it('handles empty inner arrays', () => {
    expect(
      collect([[], [1, 2], []])
        .collapse()
        .all()
    ).toEqual([1, 2])
  })

  it('collapses three nested arrays', () => {
    expect(
      collect([[1], [2], [3]])
        .collapse()
        .all()
    ).toEqual([1, 2, 3])
  })
})
