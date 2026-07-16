import { collect, lazy, LazyCollection } from '../src'

/** A counting generator so tests can observe exactly how many items were pulled. */
function counter(limit = Infinity): { pulls: () => number; gen: Generator<number> } {
  let pulls = 0
  function* make(): Generator<number> {
    for (let i = 0; i < limit; i++) {
      pulls++
      yield i
    }
  }
  return { pulls: () => pulls, gen: make() }
}

describe('LazyCollection constructor laziness (regression: iterator sources were materialised eagerly)', () => {
  it('constructing from a generator object pulls nothing', () => {
    const { pulls, gen } = counter(1000)
    void new LazyCollection(gen)
    expect(pulls()).toBe(0)
  })

  it('only pulls what downstream operators consume', () => {
    const { pulls, gen } = counter(1000)
    const taken = new LazyCollection(gen).take(3).all()
    expect(taken).toEqual([0, 1, 2])
    expect(pulls()).toBe(3)
  })

  it('supports infinite generator objects (would previously hang)', () => {
    const { gen } = counter()
    expect(new LazyCollection(gen).take(5).all()).toEqual([0, 1, 2, 3, 4])
  })

  it('one-shot iterator sources are re-iterable via the replay buffer', () => {
    const { pulls, gen } = counter(3)
    const l = new LazyCollection(gen)
    expect(l.count()).toBe(3)
    expect(l.all()).toEqual([0, 1, 2])
    // Second pass replays the cache — the generator ran exactly once.
    expect(pulls()).toBe(3)
  })
})

describe('LazyCollection.unique streaming (regression: drained the source at call time)', () => {
  it('calling unique() pulls nothing until consumption', () => {
    const { pulls, gen } = counter(1000)
    const u = new LazyCollection(gen).unique()
    expect(pulls()).toBe(0)
    expect(u.take(2).all()).toEqual([0, 1])
    expect(pulls()).toBe(2)
  })

  it('works on an infinite duplicate stream', () => {
    const l = lazy(function* (): Generator<number> {
      let i = 0
      for (;;) {
        yield i % 3
        i++
      }
    })
    expect(l.unique().take(3).all()).toEqual([0, 1, 2])
  })

  it('matches eager semantics: loose vs strict', () => {
    expect(lazy(['1', 1, 2]).unique().all()).toEqual(['1', 2])
    expect(lazy(['1', 1, 2]).uniqueStrict().all()).toEqual(['1', 1, 2])
    expect(collect(['1', 1, 2]).unique().all()).toEqual(lazy(['1', 1, 2]).unique().all())
  })

  it('supports key and callback retrievers', () => {
    expect(
      lazy([{ id: 1 }, { id: 1 }, { id: 2 }])
        .unique('id')
        .all()
    ).toEqual([{ id: 1 }, { id: 2 }])
    expect(
      lazy([4, 5, 6])
        .unique((n) => n % 2)
        .all()
    ).toEqual([4, 5])
  })
})

describe('LazyCollection.chunkWhile streaming (regression: materialised the whole source)', () => {
  it('matches the eager implementation', () => {
    const eager = collect([1, 1, 2, 2, 3])
      .chunkWhile((v, _k, chunk) => v === chunk[chunk.length - 1])
      .map((c) => c.all())
      .all()
    const streamed = lazy([1, 1, 2, 2, 3])
      .chunkWhile((v, _k, chunk) => v === chunk[chunk.length - 1])
      .map((c) => c.all())
      .all()
    expect(streamed).toEqual(eager)
    expect(streamed).toEqual([[1, 1], [2, 2], [3]])
  })

  it('streams chunks from an infinite source', () => {
    const l = lazy(function* (): Generator<number> {
      for (let i = 0; ; i++) yield i
    })
    const chunks = l
      .chunkWhile((v, _k, chunk) => Math.floor(v / 3) === Math.floor((chunk[0] ?? v) / 3))
      .take(2)
      .map((c) => c.all())
      .all()
    expect(chunks).toEqual([
      [0, 1, 2],
      [3, 4, 5]
    ])
  })

  it('passes the source index and current chunk to the predicate', () => {
    const seen: Array<[number, number, number]> = []
    lazy([10, 20, 30])
      .chunkWhile((item, key, chunk) => {
        seen.push([item, key, chunk.length])
        return true
      })
      .all()
    expect(seen).toEqual([
      [20, 1, 1],
      [30, 2, 2]
    ])
  })
})

describe('LazyCollection.partition laziness (regression: consumed the source at call time)', () => {
  it('matches eager semantics', () => {
    const [evens, odds] = lazy([1, 2, 3, 4]).partition((n) => n % 2 === 0)
    expect(evens.all()).toEqual([2, 4])
    expect(odds.all()).toEqual([1, 3])
  })

  it('pulls nothing at call time and works on infinite sources', () => {
    const { pulls, gen } = counter()
    const [evens] = new LazyCollection(gen).partition((n) => n % 2 === 0)
    expect(pulls()).toBe(0)
    expect(evens.take(2).all()).toEqual([0, 2])
    expect(pulls()).toBe(3)
  })

  it('shares the source: both sides fully consumed enumerate it only once', () => {
    const { pulls, gen } = counter(4)
    const [evens, odds] = new LazyCollection(gen).partition((n) => n % 2 === 0)
    expect(evens.all()).toEqual([0, 2])
    expect(odds.all()).toEqual([1, 3])
    expect(pulls()).toBe(4)
  })
})

describe('LazyCollection.cycle (regression: Collection.cycle() error referred to a missing method)', () => {
  it('cycles infinitely with take()', () => {
    expect(lazy([1, 2]).cycle().take(5).all()).toEqual([1, 2, 1, 2, 1])
  })

  it('cycles a finite number of times', () => {
    expect(lazy([1, 2]).cycle(2).all()).toEqual([1, 2, 1, 2])
    expect(lazy([1, 2]).cycle(0).all()).toEqual([])
  })

  it('yields nothing for an empty source instead of spinning forever', () => {
    expect(lazy<number>([]).cycle().take(3).all()).toEqual([])
  })

  it('works on one-shot generator sources', () => {
    const { gen } = counter(2)
    expect(new LazyCollection(gen).cycle(3).all()).toEqual([0, 1, 0, 1, 0, 1])
  })

  it('is reachable through collect(...).lazy().cycle() as Collection.cycle() advises', () => {
    expect(collect([1, 2]).lazy().cycle().take(3).all()).toEqual([1, 2, 1])
  })
})
