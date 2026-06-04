import { collect } from '../src'

describe('skip', () => {
  it('skips the first N items', () => {
    expect(collect([1, 2, 3, 4, 5]).skip(2).all()).toEqual([3, 4, 5])
  })

  it('returns empty when skipping all items', () => {
    expect(collect([1, 2, 3]).skip(3).all()).toEqual([])
  })

  it('returns all items when skipping 0', () => {
    expect(collect([1, 2, 3]).skip(0).all()).toEqual([1, 2, 3])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).skip(2).all()).toEqual([])
  })
})

describe('skipUntil', () => {
  it('skips items until predicate is true', () => {
    expect(
      collect([1, 2, 3, 4])
        .skipUntil((v) => v === 3)
        .all()
    ).toEqual([3, 4])
  })

  it('returns empty when predicate never matches', () => {
    expect(
      collect([1, 2, 3])
        .skipUntil((v) => v > 10)
        .all()
    ).toEqual([])
  })

  it('returns all items when predicate matches first', () => {
    expect(
      collect([1, 2, 3])
        .skipUntil((v) => v === 1)
        .all()
    ).toEqual([1, 2, 3])
  })

  it('skips until matching value (non-function)', () => {
    expect(collect([1, 2, 3, 4]).skipUntil(3).all()).toEqual([3, 4])
  })

  it('returns empty when value not found', () => {
    expect(collect([1, 2, 3]).skipUntil(99).all()).toEqual([])
  })
})

describe('skipWhile', () => {
  it('skips while predicate is true', () => {
    expect(
      collect([1, 2, 3, 4])
        .skipWhile((v) => v < 3)
        .all()
    ).toEqual([3, 4])
  })

  it('returns empty when predicate always true', () => {
    expect(
      collect([1, 2, 3])
        .skipWhile(() => true)
        .all()
    ).toEqual([])
  })

  it('returns all when predicate always false', () => {
    expect(
      collect([1, 2, 3])
        .skipWhile(() => false)
        .all()
    ).toEqual([1, 2, 3])
  })

  it('returns empty for empty collection', () => {
    expect(
      collect([])
        .skipWhile(() => true)
        .all()
    ).toEqual([])
  })
})
