import { collect } from '../src/collect'

describe('collapseWithKeys', () => {
  it('merges objects keeping all keys', () => {
    const result = collect([{ first: [1, 2, 3] }, { second: [4, 5, 6] }])
      .collapseWithKeys()
      .all()
    expect(result).toEqual([{ first: [1, 2, 3], second: [4, 5, 6] }])
  })

  it('returns empty object for empty collection', () => {
    expect(collect([]).collapseWithKeys().all()).toEqual([{}])
  })

  it('merges single object', () => {
    const result = collect([{ a: 1, b: 2 }])
      .collapseWithKeys()
      .all()
    expect(result).toEqual([{ a: 1, b: 2 }])
  })

  it('later keys overwrite earlier keys with same name', () => {
    const result = collect([{ key: 'first' }, { key: 'second' }])
      .collapseWithKeys()
      .all()
    expect(result[0]).toEqual({ key: 'second' })
  })

  it('merges multiple objects into one', () => {
    const result = collect([{ a: 1 }, { b: 2 }, { c: 3 }])
      .collapseWithKeys()
      .all()
    expect(result).toEqual([{ a: 1, b: 2, c: 3 }])
  })

  it('always wraps result in an array of length 1', () => {
    const result = collect([{ x: 10 }, { y: 20 }]).collapseWithKeys()
    expect(result.count()).toBe(1)
  })

  it('handles nested arrays as values', () => {
    const result = collect([{ nums: [1, 2] }, { strs: ['a', 'b'] }])
      .collapseWithKeys()
      .all()
    expect(result[0]).toEqual({ nums: [1, 2], strs: ['a', 'b'] })
  })
})
