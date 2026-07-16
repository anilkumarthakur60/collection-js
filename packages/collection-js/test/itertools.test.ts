import { collect } from '../src'

describe('scan', () => {
  it('emits the running accumulator at each step', () => {
    expect(collect([1, 2, 3, 4]).scan((a, b) => a + b, 0).all()).toEqual([1, 3, 6, 10])
  })

  it('returns empty for empty input', () => {
    expect(collect<number>([]).scan((a, b) => a + b, 0).all()).toEqual([])
  })

  it('passes the index to the callback', () => {
    const seen: number[] = []
    collect(['a', 'b', 'c']).scan((acc, _v, i) => { seen.push(i); return acc }, '').all()
    expect(seen).toEqual([0, 1, 2])
  })
})

describe('pairwise', () => {
  it('yields consecutive pairs', () => {
    expect(collect([1, 2, 3, 4]).pairwise().all()).toEqual([
      [1, 2],
      [2, 3],
      [3, 4],
    ])
  })

  it('returns empty for fewer than 2 items', () => {
    expect(collect([1]).pairwise().all()).toEqual([])
    expect(collect<number>([]).pairwise().all()).toEqual([])
  })
})

describe('enumerate', () => {
  it('tags each item with its index', () => {
    expect(collect(['a', 'b', 'c']).enumerate().all()).toEqual([
      [0, 'a'],
      [1, 'b'],
      [2, 'c'],
    ])
  })

  it('accepts a custom start offset', () => {
    expect(collect(['a', 'b']).enumerate(10).all()).toEqual([
      [10, 'a'],
      [11, 'b'],
    ])
  })
})

describe('cycle', () => {
  it('repeats the sequence n times', () => {
    expect(collect([1, 2]).cycle(3).all()).toEqual([1, 2, 1, 2, 1, 2])
  })

  it('throws on Infinity (use lazy().cycle for that)', () => {
    expect(() => collect([1, 2]).cycle(Infinity)).toThrow()
  })
})

describe('interleave', () => {
  it('round-robins items from multiple sources', () => {
    expect(collect([1, 2, 3]).interleave([10, 20, 30], [100, 200, 300]).all()).toEqual([
      1, 10, 100, 2, 20, 200, 3, 30, 300,
    ])
  })

  it('stops at the shortest source', () => {
    expect(collect([1, 2, 3]).interleave([10]).all()).toEqual([1, 10])
  })
})

describe('permutations', () => {
  it('yields all n! orderings by default', () => {
    expect(collect([1, 2, 3]).permutations().all()).toEqual([
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ])
  })

  it('yields r-length permutations when r is supplied', () => {
    expect(collect([1, 2, 3]).permutations(2).count()).toBe(6)
  })
})

describe('combinations', () => {
  it('yields all r-length combinations', () => {
    expect(collect([1, 2, 3, 4]).combinations(2).all()).toEqual([
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 3],
      [2, 4],
      [3, 4],
    ])
  })

  it('returns empty when r > n', () => {
    expect(collect([1, 2]).combinations(5).all()).toEqual([])
  })
})

describe('powerSet', () => {
  it('yields all 2^n subsets', () => {
    expect(collect(['a', 'b']).powerSet().all()).toEqual([[], ['a'], ['b'], ['a', 'b']])
  })

  it('contains 2^n entries for n items', () => {
    expect(collect([1, 2, 3]).powerSet().count()).toBe(8)
  })
})
