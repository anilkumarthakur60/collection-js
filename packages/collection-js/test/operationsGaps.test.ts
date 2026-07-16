import { collect, lazy, looseEqual, operations, Collection } from '../src'
import type { ClassConstructor } from '../src/support/types'

describe('teeOf (audit: shared-iterator buffering logic untested)', () => {
  it('two consumers each see the full sequence when interleaved', () => {
    const [a, b] = operations.teeOf([1, 2, 3, 4], 2)
    // Interleave pulls so both the direct-yield and the queue-drain paths run.
    expect(a.next().value).toBe(1)
    expect(b.next().value).toBe(1)
    expect(b.next().value).toBe(2)
    expect(b.next().value).toBe(3)
    expect(a.next().value).toBe(2)
    expect([...a]).toEqual([3, 4])
    expect([...b]).toEqual([4])
    expect(a.next().done).toBe(true)
    expect(b.next().done).toBe(true)
  })

  it('n=3 consumers all drain the source exactly once', () => {
    let pulls = 0
    function* src(): Generator<number> {
      for (const v of [10, 20]) {
        pulls++
        yield v
      }
    }
    const [a, b, c] = operations.teeOf(src(), 3)
    expect([...a]).toEqual([10, 20])
    expect([...b]).toEqual([10, 20])
    expect([...c]).toEqual([10, 20])
    expect(pulls).toBe(2)
  })

  it('empty source yields nothing for every consumer', () => {
    const [a, b] = operations.teeOf<number>([], 2)
    expect([...a]).toEqual([])
    expect([...b]).toEqual([])
  })

  it('an abandoned consumer does not block the other', () => {
    const [a, b] = operations.teeOf([1, 2, 3], 2)
    void a // never consumed
    expect([...b]).toEqual([1, 2, 3])
  })
})

describe('zipManyOf (audit: untested)', () => {
  it('stops at the shortest source', () => {
    expect(operations.zipManyOf([1, 2, 3], [4, 5], [6, 7, 8])).toEqual([
      [1, 4, 6],
      [2, 5, 7]
    ])
  })

  it('zero sources produce an empty result', () => {
    expect(operations.zipManyOf()).toEqual([])
  })

  it('a single source produces singleton tuples', () => {
    expect(operations.zipManyOf([1, 2])).toEqual([[1], [2]])
  })
})

describe('unionObjectsOf (audit: untested)', () => {
  it('original keys take precedence over incoming ones', () => {
    expect(operations.unionObjectsOf([{ a: 1, b: 2 }], [{ b: 99, c: 3 }])).toEqual([
      { a: 1, b: 2, c: 3 }
    ])
  })

  it('empty original copies the other side', () => {
    expect(operations.unionObjectsOf<{ a: number }>([], [{ a: 1 }])).toEqual([{ a: 1 }])
  })

  it('non-object entries on the other side are ignored', () => {
    expect(
      operations.unionObjectsOf<object>([{ a: 1 }], [5 as unknown as object, { b: 2 }])
    ).toEqual([{ a: 1, b: 2 }])
  })
})

describe('dot()/undot() leaf preservation (audit: empty-object/empty-array leaves untested)', () => {
  it('dot keeps empty objects and arrays as leaves', () => {
    expect(collect([{ a: {}, b: [], c: 1 }]).dot()).toEqual({ a: {}, b: [], c: 1 })
  })

  it('dot flattens nested empty leaves under their prefix', () => {
    expect(collect([{ x: { y: {}, z: [] } }]).dot()).toEqual({ 'x.y': {}, 'x.z': [] })
  })

  it('undot places non-plain-object items under their index', () => {
    expect(
      collect<unknown>(['scalar', { 'a.b': 1 }])
        .undot()
        .first()
    ).toEqual({
      0: 'scalar',
      a: { b: 1 }
    })
  })
})

describe('itertools misc gaps', () => {
  it('cycle of an empty collection yields nothing', () => {
    expect(collect<number>([]).cycle(3).all()).toEqual([])
  })

  it('cycle(Infinity) on the eager Collection throws with lazy advice', () => {
    expect(() => collect([1]).cycle()).toThrow(/lazy\(\)\.cycle\(\)/)
  })

  it('interleaveOf with zero sources returns []', () => {
    expect(operations.interleaveOf()).toEqual([])
  })

  it('permutations with r greater than n yields nothing', () => {
    expect(collect([1, 2]).permutations(3).all()).toEqual([])
  })
})

describe('mutation helper gaps (pure ops variants)', () => {
  it('pushOf/prependOf/putOf return new arrays', () => {
    const src = [1, 2]
    expect(operations.pushOf(src, [3])).toEqual([1, 2, 3])
    expect(operations.prependOf(src, 0)).toEqual([0, 1, 2])
    expect(src).toEqual([1, 2])
    expect(operations.putOf([{ a: 1 }], 'a', 9)).toEqual([{ a: 9 }])
  })

  it('popOf/shiftOf with non-positive counts remove nothing', () => {
    expect(operations.popOf([1, 2], 0)).toEqual({ remaining: [1, 2], removed: [] })
    expect(operations.shiftOf([1, 2], -1)).toEqual({ remaining: [1, 2], removed: [] })
  })

  it('forget leaves non-plain-object items untouched when removing string keys', () => {
    const c = collect<unknown>([1, { a: 1, b: 2 }])
    expect(c.forget('a').all()).toEqual([1, { b: 2 }])
  })

  it('mergeRecursiveOf pads with the longer side and keeps values when a patch is undefined', () => {
    expect(operations.mergeRecursiveOf<unknown>([1], [10, 20])).toEqual([[1, 10], 20])
    expect(operations.mergeRecursiveOf<unknown>([1, 2], [10])).toEqual([[1, 10], 2])
    expect(operations.mergeRecursiveOf<unknown>([1, 2], [10, undefined])).toEqual([[1, 10], 2])
  })
})

describe('collapseWithKeys skips non-object entries (Collection.ts guard)', () => {
  it('scalar entries are ignored', () => {
    expect(
      collect<unknown>([{ a: 1 }, 5, { b: 2 }])
        .collapseWithKeys()
        .all()
    ).toEqual([{ a: 1, b: 2 }])
  })
})

describe('chunking guard clauses (audit: size/step/page <= 0 branches untested)', () => {
  it('sliding with non-positive size or step returns []', () => {
    expect(collect([1, 2, 3]).sliding(0).all()).toEqual([])
    expect(collect([1, 2, 3]).sliding(2, 0).all()).toEqual([])
  })

  it('forPage with page < 1 or perPage <= 0 returns []', () => {
    expect(collect([1, 2, 3]).forPage(0, 2).all()).toEqual([])
    expect(collect([1, 2, 3]).forPage(1, 0).all()).toEqual([])
  })

  it('nth with non-positive step returns []', () => {
    expect(collect([1, 2, 3]).nth(0).all()).toEqual([])
    expect(collect([1, 2, 3]).nth(-2).all()).toEqual([])
  })
})

describe('accessor gaps', () => {
  it('getAt resolves negative indices and defaults (audit: uncovered)', () => {
    expect(operations.getAt([1, 2, 3], -1)).toBe(3)
    expect(operations.getAt([1, 2, 3], -3)).toBe(1)
    expect(operations.getAt([1, 2, 3], -4)).toBeUndefined()
    expect(operations.getAt([1, 2, 3], 5, 9)).toBe(9)
  })

  it('after/before honour strict=true (audit: strict arm untested)', () => {
    const items: unknown[] = ['1', 1, 2]
    expect(collect(items).after(1, true)).toBe(2)
    expect(collect(items).after('1', true)).toBe(1)
    expect(collect(items).before(2, true)).toBe(1)
    expect(collect(items).before('1', true)).toBeUndefined()
  })
})

describe('contains key-value and strict arms (audit: compare.ts branches untested)', () => {
  const users = [
    { id: 1, role: 'admin' },
    { id: 2, role: 'user' }
  ]

  it('contains(key, value) matches loosely on the property', () => {
    expect(collect(users).contains('role', 'admin')).toBe(true)
    expect(collect(users).contains('id', '2')).toBe(true)
    expect(collect(users).contains('role', 'ghost')).toBe(false)
  })

  it('containsStrict(key, value) requires identical types', () => {
    expect(collect(users).containsStrict('id', 2)).toBe(true)
    expect(collect(users).containsStrict('id', '2')).toBe(false)
  })

  it('shape specs never match scalar items', () => {
    expect(collect<unknown>([1, 'x']).contains({ id: 1 })).toBe(false)
  })

  it('shape specs fail fast on the first mismatching key', () => {
    expect(collect(users).contains({ id: 1, role: 'user' })).toBe(false)
  })

  it('doesntContainOf is the exact complement (ops-level)', () => {
    expect(operations.doesntContainOf(users, { kind: 'value', value: users[0] })).toBe(false)
    expect(operations.doesntContainOf(users, { kind: 'value', value: { id: 9 } })).toBe(true)
  })

  it('doesntContainStrict complements containsStrict', () => {
    expect(collect(users).doesntContainStrict('id', '2')).toBe(true)
  })
})

describe('where variants left dark by the per-method files', () => {
  const rows = [{ active: 1 }, { active: 0 }, { active: 1 }]

  it('single-argument where(key) keeps truthy values', () => {
    expect(collect(rows).where('active').all()).toEqual([{ active: 1 }, { active: 1 }])
  })

  it('whereIn strict arm deep-compares object values', () => {
    const data = [{ tag: { id: 1 } }, { tag: { id: 2 } }]
    expect(
      collect(data)
        .whereInStrict('tag', [{ id: 2 }])
        .all()
    ).toEqual([{ tag: { id: 2 } }])
  })
})

describe('conditional gaps: function conditions and value-returning callbacks', () => {
  it('when accepts a condition callback receiving the collection', () => {
    const seen: string[] = []
    collect([1, 2, 3]).when(
      (c) => c.count() === 3,
      () => void seen.push('yes')
    )
    collect([1]).when(
      (c) => c.count() === 3,
      () => void seen.push('no'),
      () => void seen.push('fallback')
    )
    expect(seen).toEqual(['yes', 'fallback'])
  })

  it('unless accepts a condition callback (Collection.ts function-inversion branch)', () => {
    const seen: string[] = []
    collect([1]).unless(
      (c) => c.count() > 1,
      () => void seen.push('ran')
    )
    expect(seen).toEqual(['ran'])
  })

  it('when returns the callback result when one is returned', () => {
    const original = collect([1, 2])
    const other = collect([9])
    expect(original.when(true, () => other)).toBe(other)
    expect(original.when(true, () => undefined)).toBe(original)
  })
})

describe('sequence and slice gaps', () => {
  it('descending static range (audit: rangeOf descending branch)', () => {
    expect(collect([]).range(5, 1, -2).all()).toEqual([5, 3, 1])
  })

  it('range with a zero step throws RangeError', () => {
    expect(() => collect([]).range(1, 5, 0)).toThrow(RangeError)
  })

  it('slice with a negative length trims from the end (sliceOps.ts:41)', () => {
    expect(collect([1, 2, 3, 4, 5]).slice(1, -1).all()).toEqual([2, 3, 4])
  })

  it('random(0) returns an empty collection (random.ts guard)', () => {
    expect(collect([1, 2]).random(0).all()).toEqual([])
  })
})

describe('sorting gaps (defaultCompare/toComparableString/multi-spec)', () => {
  it('objects sort by their JSON form, not [object Object]', () => {
    const sorted = collect([{ b: 2 }, { a: 1 }])
      .sort()
      .all()
    expect(sorted).toEqual([{ a: 1 }, { b: 2 }])
  })

  it('circular objects fall back to Object.prototype.toString without throwing', () => {
    const a: Record<string, unknown> = { x: 1 }
    a['self'] = a
    expect(() => collect([a, a]).sort().all()).not.toThrow()
  })

  it('null and undefined sort to the end', () => {
    expect(collect<unknown>([3, null, 1]).sort().all()).toEqual([1, 3, null])
    expect(collect<unknown>([undefined, 2]).sort().all()).toEqual([2, undefined])
  })

  it('multi-spec sortBy applies specs in order and returns 0 on full ties', () => {
    const rows = [
      { a: 1, b: 'x', id: 1 },
      { a: 1, b: 'y', id: 2 },
      { a: 0, b: 'z', id: 3 },
      { a: 1, b: 'y', id: 4 }
    ]
    const sorted = collect(rows).sortBy(['a', ['b', 'desc']])
    expect(sorted.pluck('id').all()).toEqual([3, 2, 4, 1])
  })

  it('sortKeys and sortKeysUsing pass non-object items through (ops-level)', () => {
    expect(operations.sortKeysOf([{ b: 1, a: 2 }, 5] as unknown as readonly object[])).toEqual([
      { a: 2, b: 1 },
      5
    ])
    expect(
      operations.sortKeysUsingOf([{ b: 1, a: 2 }, 5] as unknown as readonly object[], (x, y) =>
        y.localeCompare(x)
      )
    ).toEqual([{ b: 1, a: 2 }, 5])
  })

  it('lazy sortKeysDesc mirrors eager ordering', () => {
    expect(
      Object.keys(
        lazy([{ a: 1, b: 2 }])
          .sortKeysDesc()
          .first() ?? {}
      )
    ).toEqual(['b', 'a'])
  })
})

describe('stats guard branches', () => {
  it('sampleVariance/sampleStddev need at least two samples', () => {
    expect(collect([5]).sampleVariance()).toBeUndefined()
    expect(collect([5]).sampleStddev()).toBeUndefined()
  })

  it('histogram throws on a non-positive or fractional bin count', () => {
    expect(() => collect([1, 2]).histogram(0)).toThrow(RangeError)
    expect(() => collect([1, 2]).histogram(2.5)).toThrow(RangeError)
  })

  it('histogram of an empty numeric population is empty', () => {
    expect(collect<number>([]).histogram(3)).toEqual([])
  })

  it('histogram collapses to a single bin when min === max', () => {
    expect(collect([4, 4, 4]).histogram(5)).toEqual([{ from: 4, to: 4, count: 3 }])
  })

  it('correlation needs at least two numeric pairs', () => {
    expect(collect([{ x: 1, y: 1 }]).correlation('x', 'y')).toBeUndefined()
    expect(
      collect([
        { x: 'nope', y: 1 },
        { x: 'nah', y: 2 }
      ]).correlation('x', 'y')
    ).toBeUndefined()
  })
})

describe('transformation gaps', () => {
  it('flatMap accepts scalar (non-array) returns', () => {
    expect(
      collect([1, 2])
        .flatMap((n) => n * 10)
        .all()
    ).toEqual([10, 20])
  })

  it('flatten descends into plain objects', () => {
    expect(
      collect<unknown>([{ a: 1, b: { c: 2 } }, 3])
        .flatten()
        .all()
    ).toEqual([1, 2, 3])
  })
})

describe('set-operation guards for empty/non-object inputs', () => {
  it('diffAssoc on an empty collection stays empty', () => {
    expect(
      collect<{ a: number }>([])
        .diffAssoc([{ a: 1 }])
        .all()
    ).toEqual([])
  })

  it('diffAssoc keeps non-object items', () => {
    expect(
      collect<unknown>([5, { a: 1 }])
        .diffAssoc([{ a: 1 }])
        .all()
    ).toEqual([5])
  })

  it('intersectAssoc on empty stays empty and passes scalars through', () => {
    expect(
      collect<{ a: number }>([])
        .intersectAssoc([{ a: 1 }])
        .all()
    ).toEqual([])
    expect(operations.intersectAssocOf([5] as unknown as readonly object[], [{ a: 1 }])).toEqual([
      5
    ])
  })

  it('diffKeys/intersectByKeys pass non-object items through (ops-level)', () => {
    expect(operations.diffKeysOf([5] as unknown as readonly object[], ['a'])).toEqual([5])
    expect(operations.intersectByKeysOf([5] as unknown as readonly object[], ['a'])).toEqual([5])
  })

  it('intersectAssocUsing matches keys via the comparator', () => {
    const rows = [{ A: 'x', b: 'y' }]
    const result = collect(rows).intersectAssocUsing({ a: 'x' }, (l, r) =>
      l.toLowerCase().localeCompare(r.toLowerCase())
    )
    expect(result.all()).toEqual([{ A: 'x' }])
  })

  it('crossJoinOf with zero arrays returns [] (ops-level)', () => {
    expect(operations.crossJoinOf()).toEqual([])
  })

  it('onlyOf/exceptOf handle non-object items (ops-level)', () => {
    expect(operations.onlyOf([5] as unknown as readonly object[], ['a'])).toEqual([{}])
    expect(operations.exceptOf([5] as unknown as readonly object[], ['a'])).toEqual([5])
  })

  it('diffAssoc/intersectAssoc treat a non-object other side as empty (ops-level)', () => {
    expect(operations.diffAssocOf([{ a: 1 }], [5] as unknown as readonly object[])).toEqual([
      { a: 1 }
    ])
    expect(operations.intersectAssocOf([{ a: 1 }], [5] as unknown as readonly object[])).toEqual([
      {}
    ])
  })

  it('intersectAssocUsingOf guards empty and non-object items (ops-level)', () => {
    expect(operations.intersectAssocUsingOf([], { a: 1 }, (x, y) => x.localeCompare(y))).toEqual([])
    expect(
      operations.intersectAssocUsingOf([5] as unknown as readonly object[], { a: 1 }, (x, y) =>
        x.localeCompare(y)
      )
    ).toEqual([5])
  })
})

describe('Collection-argument overloads (audit: only array arguments were tested)', () => {
  const base = collect([1, 2, 3])

  it('set operations accept Collection instances', () => {
    expect(base.union(collect([3, 4])).all()).toEqual([1, 2, 3, 4])
    expect(
      collect([{ a: 1 }])
        .diffAssoc(collect<Partial<{ a: number }>>([{ a: 2 }]))
        .all()
    ).toEqual([{ a: 1 }])
    expect(
      collect([1, 2])
        .diffAssocUsing(collect([2]), (x, y) => x - y)
        .all()
    ).toEqual([1])
    expect(base.intersectUsing(collect([2, 9]), (x, y) => x - y).all()).toEqual([2])
    expect(
      collect([{ a: 1, b: 2 }])
        .intersectAssoc(collect<Partial<{ a: number; b: number }>>([{ a: 1 }]))
        .all()
    ).toEqual([{ a: 1 }])
    expect(
      collect([{ a: 1 }])
        .mergeRecursive(collect([{ a: 9 }]))
        .all()
    ).toEqual([{ a: [1, 9] }])
  })

  it('zip and interleave accept Collection instances', () => {
    expect(base.zip(collect(['a', 'b'])).all()).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, undefined]
    ])
    expect(
      collect([1, 3])
        .interleave(collect([2, 4]))
        .all()
    ).toEqual([1, 2, 3, 4])
  })

  it('left/right/outer joins accept Collection right-hand sides', () => {
    const users = collect([{ id: 1 }])
    const orders = collect([{ uid: 2 }])
    expect(users.leftJoin(orders, 'id', 'uid').all()).toEqual([[{ id: 1 }, undefined]])
    expect(users.rightJoin(orders, 'id', 'uid').all()).toEqual([[undefined, { uid: 2 }]])
    expect(users.outerJoin(orders, 'id', 'uid').all()).toEqual([
      [{ id: 1 }, undefined],
      [undefined, { uid: 2 }]
    ])
  })
})

describe('residual Collection branches', () => {
  it('constructor accepts null/undefined as empty', () => {
    expect(new Collection(null).all()).toEqual([])
    expect(new Collection(undefined).all()).toEqual([])
  })

  it('repeat is an alias of multiply', () => {
    expect(collect([1, 2]).repeat(2).all()).toEqual([1, 2, 1, 2])
    expect(collect([1]).repeat(0).all()).toEqual([])
  })

  it('collapseWithKeys unwraps Collection values into arrays', () => {
    const merged = collect([{ group: collect([1, 2]) }, { other: 3 }])
      .collapseWithKeys()
      .first()
    expect(merged).toEqual({ group: [1, 2], other: 3 })
  })

  it("ensure('array') accepts arrays via the special-cased string type", () => {
    const c = collect([[1], [2]])
    expect(c.ensure('array')).toBe(c)
  })

  it('ensure falls back to "object" for constructors without a name', () => {
    const Anon = function () {
      /* noop */
    } as unknown as ClassConstructor<unknown>
    Object.defineProperty(Anon, 'name', { value: undefined })
    expect(() => collect(['x']).ensure(Anon)).toThrow(
      'Collection should only include "object" items, but string found.'
    )
  })

  it('contains supports numeric and symbol keys in the key-value form', () => {
    expect(collect([{ 0: 'zero' }]).contains(0, 'zero')).toBe(true)
    expect(collect([{ a: 1 }]).contains(Symbol('missing') as unknown as string, 'x')).toBe(false)
  })

  it('groupBy spreads items across multiple keys when the retriever returns an array', () => {
    const posts = [
      { title: 'p1', tags: ['a', 'b'] },
      { title: 'p2', tags: ['b'] }
    ]
    const grouped = collect(posts).groupBy((p) => p.tags)
    expect(grouped['a'].pluck('title').all()).toEqual(['p1'])
    expect(grouped['b'].pluck('title').all()).toEqual(['p1', 'p2'])
  })
})

describe('residual comparison/string branches', () => {
  it('compareForExtent treats equal strings and equal fallbacks as ties', () => {
    expect(collect(['a', 'a']).maxBy((s) => s)).toBe('a')
    const o1 = { k: 1 }
    const o2 = { k: 1 }
    expect(collect<unknown>([o1, o2]).maxBy((v) => v)).toBe(o1)
    expect(collect<unknown>([{ toString: () => 'z' }, 'a']).minBy((v) => v)).toBe('a')
    const zed = { toString: () => 'z' }
    expect(collect<unknown>(['a', zed]).maxBy((v) => v)).toBe(zed)
  })

  it('dot of a single empty object is an empty record (objectOps root guard)', () => {
    expect(collect([{}]).dot()).toEqual({})
  })

  it('looseEqual coerces number-vs-boolean pairs', () => {
    expect(looseEqual(1, true)).toBe(true)
    expect(looseEqual(0, false)).toBe(true)
    expect(looseEqual(2, true)).toBe(false)
  })

  it('sort falls back to Object.prototype.toString for two distinct circular objects', () => {
    const a: Record<string, unknown> = { x: 1 }
    a['self'] = a
    const b: Record<string, unknown> = { y: 2 }
    b['self'] = b
    const sorted = collect([a, b]).sort().all()
    expect(sorted).toHaveLength(2)
  })

  it('getAt returns in-range positive indices directly', () => {
    expect(operations.getAt([1, 2, 3], 0)).toBe(1)
    expect(operations.getAt([1, 2, 3], 2)).toBe(3)
  })

  it('correlation returns undefined when a variable has zero variance', () => {
    expect(
      collect([
        { x: 1, y: 1 },
        { x: 1, y: 2 }
      ]).correlation('x', 'y')
    ).toBeUndefined()
  })

  it('implode/join stringify nullish members as empty strings', () => {
    expect(collect<unknown>([null, 'x']).implode('-')).toBe('-x')
    expect(collect([{ name: null }, { name: 'b' }]).implode(',', 'name')).toBe(',b')
    expect(collect<unknown>(['a', null, 'c']).join('|')).toBe('a||c')
  })

  it('ops-level implodeOf defaults the formatter separator to the empty string', () => {
    expect(operations.implodeOf([1, 2], (n) => `<${n}>`)).toBe('<1><2>')
  })
})
