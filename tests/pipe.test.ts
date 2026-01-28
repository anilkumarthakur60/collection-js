import { collect, Collection } from '../src'

describe('pipe', () => {
  it('passes the collection to a callback and returns the result', () => {
    const result = collect([1, 2, 3]).pipe((c) => c.sum())
    expect(result).toBe(6)
  })

  it('can return a new collection', () => {
    const result = collect([1, 2, 3]).pipe((c) => c.map((v) => v * 2))
    expect(result.all()).toEqual([2, 4, 6])
  })

  it('can return a string', () => {
    const result = collect(['a', 'b', 'c']).pipe((c) => c.join(', '))
    expect(result).toBe('a, b, c')
  })

  it('works with empty collection', () => {
    const result = collect([]).pipe((c) => c.count())
    expect(result).toBe(0)
  })
})

describe('pipeInto', () => {
  it('creates an instance of the given class with the collection', () => {
    class Summary {
      total: number
      constructor(c: Collection<number>) {
        this.total = c.sum()
      }
    }
    const result = collect([1, 2, 3]).pipeInto(Summary)
    expect(result).toBeInstanceOf(Summary)
    expect(result.total).toBe(6)
  })
})

describe('pipeThrough', () => {
  it('passes collection through an array of functions', () => {
    const result = collect([1, 2, 3]).pipeThrough([
      (c) => (c as Collection<number>).map((v) => v * 2),
      (c) => (c as Collection<number>).filter((v) => v > 2)
    ])
    expect((result as Collection<number>).all()).toEqual([4, 6])
  })

  it('returns original collection when no pipes', () => {
    const c = collect([1, 2, 3])
    expect(c.pipeThrough([])).toBe(c)
  })
})
