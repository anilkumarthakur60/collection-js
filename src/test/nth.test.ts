import { collect } from '../collect'

describe('nth', () => {
  it('returns every nth element starting from 0', () => {
    expect(collect(['a', 'b', 'c', 'd', 'e', 'f']).nth(4).all()).toEqual(['a', 'e'])
  })

  it('returns every nth element with offset', () => {
    expect(collect(['a', 'b', 'c', 'd', 'e', 'f']).nth(4, 1).all()).toEqual(['b', 'f'])
  })

  it('returns every second element', () => {
    expect(collect([1, 2, 3, 4, 5, 6]).nth(2).all()).toEqual([1, 3, 5])
  })

  it('returns all items when n is 1', () => {
    expect(collect([1, 2, 3]).nth(1).all()).toEqual([1, 2, 3])
  })

  it('returns only first item when n equals collection size', () => {
    expect(collect([1, 2, 3]).nth(3).all()).toEqual([1])
  })

  it('returns empty for empty collection', () => {
    expect(collect([]).nth(2).all()).toEqual([])
  })

  it('offset beyond length returns empty', () => {
    expect(collect([1, 2, 3]).nth(2, 5).all()).toEqual([])
  })

  it('works with offset 0', () => {
    expect(collect([1, 2, 3, 4]).nth(2, 0).all()).toEqual([1, 3])
  })
})
