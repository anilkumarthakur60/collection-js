import { collect } from '../collect'

describe('take', () => {
  it('takes first N items', () => {
    expect(collect([1, 2, 3, 4, 5]).take(3).all()).toEqual([1, 2, 3])
  })

  it('returns all when count exceeds length', () => {
    expect(collect([1, 2, 3]).take(10).all()).toEqual([1, 2, 3])
  })

  it('returns empty when count is 0', () => {
    expect(collect([1, 2, 3]).take(0).all()).toEqual([])
  })

  it('negative count takes from end', () => {
    expect(collect([1, 2, 3, 4, 5]).take(-2).all()).toEqual([4, 5])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).take(3).all()).toEqual([])
  })

  it('takes single item', () => {
    expect(collect([10, 20, 30]).take(1).all()).toEqual([10])
  })
})

describe('takeUntil', () => {
  it('takes items until predicate is true', () => {
    expect(
      collect([1, 2, 3, 4])
        .takeUntil((v) => v === 3)
        .all()
    ).toEqual([1, 2])
  })

  it('takes all when predicate never matches', () => {
    expect(
      collect([1, 2, 3])
        .takeUntil((v) => v > 10)
        .all()
    ).toEqual([1, 2, 3])
  })

  it('returns empty when predicate matches first', () => {
    expect(
      collect([1, 2, 3])
        .takeUntil((v) => v === 1)
        .all()
    ).toEqual([])
  })

  it('takes until value match (non-function)', () => {
    expect(collect([1, 2, 3, 4]).takeUntil(3).all()).toEqual([1, 2])
  })

  it('takes all when value not found', () => {
    expect(collect([1, 2, 3]).takeUntil(99).all()).toEqual([1, 2, 3])
  })
})

describe('takeWhile', () => {
  it('takes while predicate is true', () => {
    expect(
      collect([1, 2, 3, 4])
        .takeWhile((v) => v < 3)
        .all()
    ).toEqual([1, 2])
  })

  it('returns all when predicate always true', () => {
    expect(
      collect([1, 2, 3])
        .takeWhile(() => true)
        .all()
    ).toEqual([1, 2, 3])
  })

  it('returns empty when predicate immediately false', () => {
    expect(
      collect([1, 2, 3])
        .takeWhile(() => false)
        .all()
    ).toEqual([])
  })

  it('returns empty for empty collection', () => {
    expect(
      collect([])
        .takeWhile(() => true)
        .all()
    ).toEqual([])
  })
})
