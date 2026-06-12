import { collect, lazy, Collection, LazyCollection, ItemNotFoundException } from '../src'

/**
 * Audit finding "LazyCollection: ~80 of ~95 public methods have zero test
 * coverage": a shared parity table executed against both collect(input) and
 * lazy(input), materialising lazy results so both sides compare equal.
 */

/** Materialise (Lazy)Collections recursively so both sides compare structurally. */
function norm(value: unknown): unknown {
  if (value instanceof Collection || value instanceof LazyCollection) {
    return norm((value as Collection<unknown> | LazyCollection<unknown>).all())
  }
  if (Array.isArray(value)) return value.map(norm)
  if (
    value !== null &&
    typeof value === 'object' &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = norm(v)
    return out
  }
  return value
}

const nums = [3, 1, 4, 1, 5, 9, 2, 6]
const people = [
  { name: 'Alice', role: 'admin', age: 35, active: 1, tags: ['a', 'x'] },
  { name: 'Bob', role: 'user', age: 28, active: 0, tags: ['b'] },
  { name: 'Cara', role: 'admin', age: 41, active: 1, tags: [] },
  { name: 'Dan', role: 'user', age: 28, active: 1, tags: ['d'] }
]

class Tag {
  constructor(public readonly label: string) {}
}

class Box<T> {
  constructor(public readonly inner: T) {}
}

type Case = readonly [name: string, eager: () => unknown, lazyRun: () => unknown]

const seededRandom = (): number => 0.42

const cases: readonly Case[] = [
  // ── Conversion ────────────────────────────────────────────────────────────
  ['toArray', () => collect(nums).toArray(), () => lazy(nums).toArray()],
  ['toJson', () => collect(nums).toJson(), () => lazy(nums).toJson()],
  ['toJSON', () => collect(nums).toJSON(), () => lazy(nums).toJSON()],
  [
    'toMap',
    () => [
      ...collect(people)
        .toMap(
          (p) => p.name,
          (p) => p.age
        )
        .entries()
    ],
    () => [
      ...lazy(people)
        .toMap(
          (p) => p.name,
          (p) => p.age
        )
        .entries()
    ]
  ],
  ['toSet', () => [...collect(nums).toSet()], () => [...lazy(nums).toSet()]],
  ['collect()', () => collect(nums).collect().all(), () => lazy(nums).collect().all()],

  // ── Inspection ────────────────────────────────────────────────────────────
  ['count', () => collect(nums).count(), () => lazy(nums).count()],
  ['isEmpty (non-empty)', () => collect(nums).isEmpty(), () => lazy(nums).isEmpty()],
  ['isEmpty (empty)', () => collect([]).isEmpty(), () => lazy([]).isEmpty()],
  ['isNotEmpty', () => collect(nums).isNotEmpty(), () => lazy(nums).isNotEmpty()],
  ['countBy()', () => collect([1, 1, 2]).countBy(), () => lazy([1, 1, 2]).countBy()],
  ['countBy(key)', () => collect(people).countBy('role'), () => lazy(people).countBy('role')],

  // ── Retrieval ─────────────────────────────────────────────────────────────
  [
    'first(predicate)',
    () => collect(nums).first((n) => n > 3),
    () => lazy(nums).first((n) => n > 3)
  ],
  ['firstOrFail', () => collect(nums).firstOrFail(), () => lazy(nums).firstOrFail()],
  [
    'firstWhere(key) truthy',
    () => collect(people).firstWhere('active'),
    () => lazy(people).firstWhere('active')
  ],
  [
    'firstWhere(key, value)',
    () => collect(people).firstWhere('role', 'user'),
    () => lazy(people).firstWhere('role', 'user')
  ],
  [
    'firstWhere(key, op, value)',
    () => collect(people).firstWhere('age', '>', 30),
    () => lazy(people).firstWhere('age', '>', 30)
  ],
  ['last()', () => collect(nums).last(), () => lazy(nums).last()],
  ['last(predicate)', () => collect(nums).last((n) => n < 5), () => lazy(nums).last((n) => n < 5)],
  ['sole (single match)', () => collect([7]).sole(), () => lazy([7]).sole()],
  [
    'sole(key, value)',
    () => collect(people).sole('name', 'Bob'),
    () => lazy(people).sole('name', 'Bob')
  ],

  // ── Search & inspection ───────────────────────────────────────────────────
  ['contains(value)', () => collect(nums).contains(9), () => lazy(nums).contains(9)],
  [
    'contains(key, value)',
    () => collect(people).contains('role', 'admin'),
    () => lazy(people).contains('role', 'admin')
  ],
  [
    'contains(shape)',
    () => collect(people).contains({ name: 'Dan' }),
    () => lazy(people).contains({ name: 'Dan' })
  ],
  [
    'containsStrict distinguishes types',
    () => collect<unknown>(['1', 2]).containsStrict(1),
    () => lazy<unknown>(['1', 2]).containsStrict(1)
  ],
  ['doesntContain', () => collect(nums).doesntContain(42), () => lazy(nums).doesntContain(42)],
  ['every', () => collect(nums).every((n) => n > 0), () => lazy(nums).every((n) => n > 0)],
  [
    'every (false, short-circuits)',
    () => collect(nums).every((n) => n < 5),
    () => lazy(nums).every((n) => n < 5)
  ],
  ['some (true)', () => collect(nums).some((n) => n === 9), () => lazy(nums).some((n) => n === 9)],
  ['some (false)', () => collect(nums).some((n) => n > 99), () => lazy(nums).some((n) => n > 99)],
  ['search(value)', () => collect(nums).search(4), () => lazy(nums).search(4)],
  ['search miss', () => collect(nums).search(42), () => lazy(nums).search(42)],
  [
    'search strict',
    () => collect<unknown>(['1', 1]).search(1, true),
    () => lazy<unknown>(['1', 1]).search(1, true)
  ],
  ['has(key)', () => collect(people).has('role'), () => lazy(people).has('role')],
  [
    'has([keys]) missing',
    () => collect(people).has(['role', 'salary']),
    () => lazy(people).has(['role', 'salary'])
  ],

  // ── Aggregation ───────────────────────────────────────────────────────────
  ['sum()', () => collect(nums).sum(), () => lazy(nums).sum()],
  ['sum(key)', () => collect(people).sumBy('age'), () => lazy(people).sum('age')],
  ['average(key)', () => collect(people).averageBy('age'), () => lazy(people).average('age')],
  ['avg(cb)', () => collect(people).avgBy((p) => p.age), () => lazy(people).avg((p) => p.age)],
  ['max()', () => collect(nums).maxBy(), () => lazy(nums).max()],
  ['max(key)', () => collect(people).maxBy('age'), () => lazy(people).max('age')],
  ['min()', () => collect(nums).minBy(), () => lazy(nums).min()],
  ['min(key)', () => collect(people).minBy('age'), () => lazy(people).min('age')],
  ['median', () => collect(nums).median(), () => lazy(nums).median()],
  ['median(key)', () => collect(people).median('age'), () => lazy(people).median('age')],
  ['mode', () => collect(nums).mode(), () => lazy(nums).mode()],
  [
    'percentage',
    () => collect(nums).percentage((n) => n > 3),
    () => lazy(nums).percentage((n) => n > 3)
  ],

  // ── Filtering ─────────────────────────────────────────────────────────────
  [
    'filter() truthy default',
    () => collect([0, 1, '', 'x', null]).filter().all(),
    () => lazy([0, 1, '', 'x', null]).filter().all()
  ],
  [
    'reject',
    () =>
      collect(nums)
        .reject((n) => n > 3)
        .all(),
    () =>
      lazy(nums)
        .reject((n) => n > 3)
        .all()
  ],
  [
    'where(key) truthy form',
    () => collect(people).where('active').all(),
    () => lazy(people).where('active').all()
  ],
  [
    'where(key, value)',
    () => collect(people).where('role', 'admin').all(),
    () => lazy(people).where('role', 'admin').all()
  ],
  [
    'where(key, op, value)',
    () => collect(people).where('age', '>=', 35).all(),
    () => lazy(people).where('age', '>=', 35).all()
  ],
  [
    'where != operator',
    () => collect(people).where('age', '!=', 28).all(),
    () => lazy(people).where('age', '!=', 28).all()
  ],
  [
    'whereStrict',
    () => collect(people).whereStrict('active', 1).all(),
    () => lazy(people).whereStrict('active', 1).all()
  ],
  [
    'whereIn',
    () => collect(people).whereIn('age', [28, 41]).all(),
    () => lazy(people).whereIn('age', [28, 41]).all()
  ],
  [
    'whereInStrict keeps 1 not "1"',
    () => collect(people).whereInStrict('active', ['1']).all(),
    () => lazy(people).whereInStrict('active', ['1']).all()
  ],
  [
    'whereNotIn',
    () => collect(people).whereNotIn('role', ['user']).all(),
    () => lazy(people).whereNotIn('role', ['user']).all()
  ],
  [
    'whereNotInStrict',
    () => collect(people).whereNotInStrict('active', ['0']).all(),
    () => lazy(people).whereNotInStrict('active', ['0']).all()
  ],
  [
    'whereBetween',
    () => collect(people).whereBetween('age', [28, 36]).all(),
    () => lazy(people).whereBetween('age', [28, 36]).all()
  ],
  [
    'whereNotBetween',
    () => collect(people).whereNotBetween('age', [28, 36]).all(),
    () => lazy(people).whereNotBetween('age', [28, 36]).all()
  ],
  [
    'whereNull',
    () =>
      collect([{ v: null }, { v: 1 }])
        .whereNull('v')
        .all(),
    () =>
      lazy([{ v: null }, { v: 1 }])
        .whereNull('v')
        .all()
  ],
  [
    'whereNotNull',
    () =>
      collect([{ v: null }, { v: 1 }])
        .whereNotNull('v')
        .all(),
    () =>
      lazy([{ v: null }, { v: 1 }])
        .whereNotNull('v')
        .all()
  ],
  [
    'whereInstanceOf',
    () =>
      collect<unknown>([new Tag('a'), 5, new Tag('b')])
        .whereInstanceOf(Tag)
        .all(),
    () =>
      lazy<unknown>([new Tag('a'), 5, new Tag('b')])
        .whereInstanceOf(Tag)
        .all()
  ],

  // ── Transformation ────────────────────────────────────────────────────────
  [
    'mapInto',
    () => collect(['a']).mapInto(Tag).first()?.label,
    () => lazy(['a']).mapInto(Tag).first()?.label
  ],
  [
    'mapSpread',
    () =>
      collect([
        [1, 2],
        [3, 4]
      ])
        .mapSpread((a, b) => a + b)
        .all(),
    () =>
      lazy([
        [1, 2],
        [3, 4]
      ])
        .mapSpread((a, b) => a + b)
        .all()
  ],
  [
    'mapWithKeys',
    () => collect(people).mapWithKeys((p) => [p.name, p.age]),
    () => lazy(people).mapWithKeys((p) => [p.name, p.age])
  ],
  [
    'flatMap scalar + array results',
    () =>
      collect([1, 2])
        .flatMap((n) => (n === 1 ? n : [n, n * 10]))
        .all(),
    () =>
      lazy([1, 2])
        .flatMap((n) => (n === 1 ? n : [n, n * 10]))
        .all()
  ],
  [
    'flatten depth 1',
    () =>
      collect<unknown>([1, [2, [3]]])
        .flatten(1)
        .all(),
    () =>
      lazy<unknown>([1, [2, [3]]])
        .flatten(1)
        .all()
  ],
  [
    'flatten infinite',
    () =>
      collect<unknown>([1, [2, [3, [4]]]])
        .flatten()
        .all(),
    () =>
      lazy<unknown>([1, [2, [3, [4]]]])
        .flatten()
        .all()
  ],
  [
    'collapse',
    () =>
      collect<readonly number[] | number>([[1, 2], 3, [4]])
        .collapse()
        .all(),
    () =>
      lazy<readonly number[] | number>([[1, 2], 3, [4]])
        .collapse()
        .all()
  ],
  ['pluck(key)', () => collect(people).pluck('name').all(), () => lazy(people).pluck('name').all()],
  [
    'pluck(key, keyBy)',
    () => collect(people).pluck('age', 'name'),
    () => lazy(people).pluck('age', 'name')
  ],
  [
    'pluck dot-path',
    () =>
      collect([{ u: { n: 'x' } }])
        .pluck('u.n')
        .all(),
    () =>
      lazy([{ u: { n: 'x' } }])
        .pluck('u.n')
        .all()
  ],

  // ── Slicing ───────────────────────────────────────────────────────────────
  ['take negative', () => collect(nums).take(-3).all(), () => lazy(nums).take(-3).all()],
  ['takeUntil(value)', () => collect(nums).takeUntil(5).all(), () => lazy(nums).takeUntil(5).all()],
  [
    'takeUntil(predicate)',
    () =>
      collect(nums)
        .takeUntil((n) => n > 4)
        .all(),
    () =>
      lazy(nums)
        .takeUntil((n) => n > 4)
        .all()
  ],
  [
    'takeWhile',
    () =>
      collect(nums)
        .takeWhile((n) => n < 5)
        .all(),
    () =>
      lazy(nums)
        .takeWhile((n) => n < 5)
        .all()
  ],
  ['skip', () => collect(nums).skip(5).all(), () => lazy(nums).skip(5).all()],
  ['skipUntil(value)', () => collect(nums).skipUntil(5).all(), () => lazy(nums).skipUntil(5).all()],
  [
    'skipUntil(predicate)',
    () =>
      collect(nums)
        .skipUntil((n) => n > 4)
        .all(),
    () =>
      lazy(nums)
        .skipUntil((n) => n > 4)
        .all()
  ],
  [
    'skipUntil no match',
    () => collect(nums).skipUntil(42).all(),
    () => lazy(nums).skipUntil(42).all()
  ],
  [
    'skipWhile',
    () =>
      collect(nums)
        .skipWhile((n) => n < 4)
        .all(),
    () =>
      lazy(nums)
        .skipWhile((n) => n < 4)
        .all()
  ],
  ['slice(start)', () => collect(nums).slice(3).all(), () => lazy(nums).slice(3).all()],
  [
    'slice(start, length)',
    () => collect(nums).slice(2, 3).all(),
    () => lazy(nums).slice(2, 3).all()
  ],
  ['slice negative start', () => collect(nums).slice(-3).all(), () => lazy(nums).slice(-3).all()],
  [
    'slice negative length',
    () => collect(nums).slice(1, -2).all(),
    () => lazy(nums).slice(1, -2).all()
  ],
  ['forPage', () => collect(nums).forPage(2, 3).all(), () => lazy(nums).forPage(2, 3).all()],
  ['nth', () => collect(nums).nth(3).all(), () => lazy(nums).nth(3).all()],
  ['nth with offset', () => collect(nums).nth(3, 1).all(), () => lazy(nums).nth(3, 1).all()],

  // ── Chunking & grouping ───────────────────────────────────────────────────
  ['chunk', () => collect(nums).chunk(3), () => lazy(nums).chunk(3)],
  ['split', () => collect(nums).split(3), () => lazy(nums).split(3)],
  ['splitIn', () => collect(nums).splitIn(3), () => lazy(nums).splitIn(3)],
  ['keyBy', () => collect(people).keyBy('name'), () => lazy(people).keyBy('name')],

  // ── Sorting ───────────────────────────────────────────────────────────────
  ['sort', () => collect(nums).sort().all(), () => lazy(nums).sort().all()],
  [
    'sort(comparator)',
    () =>
      collect(nums)
        .sort((a, b) => b - a)
        .all(),
    () =>
      lazy(nums)
        .sort((a, b) => b - a)
        .all()
  ],
  ['sortDesc', () => collect(nums).sortDesc().all(), () => lazy(nums).sortDesc().all()],
  [
    'sortBy(key)',
    () => collect(people).sortBy('age').all(),
    () => lazy(people).sortBy('age').all()
  ],
  [
    'sortBy tuple desc',
    () =>
      collect(people)
        .sortBy([['age', 'desc']])
        .all(),
    () =>
      lazy(people)
        .sortBy([['age', 'desc']])
        .all()
  ],
  [
    'sortByDesc',
    () => collect(people).sortByDesc('name').all(),
    () => lazy(people).sortByDesc('name').all()
  ],
  [
    'sortKeys',
    () =>
      collect([{ b: 1, a: 2 }])
        .sortKeys()
        .all(),
    () =>
      lazy([{ b: 1, a: 2 }])
        .sortKeys()
        .all()
  ],
  [
    'sortKeysDesc',
    () =>
      collect([{ a: 1, b: 2 }])
        .sortKeysDesc()
        .all(),
    () =>
      lazy([{ a: 1, b: 2 }])
        .sortKeysDesc()
        .all()
  ],
  ['reverse', () => collect(nums).reverse().all(), () => lazy(nums).reverse().all()],
  [
    'shuffle (seeded)',
    () => collect(nums).shuffle(seededRandom).all(),
    () => lazy(nums).shuffle(seededRandom).all()
  ],
  ['values', () => collect(nums).values().all(), () => lazy(nums).values().all()],
  ['keys (objects)', () => collect(people).keys().all(), () => lazy(people).keys().all()],
  ['keys (scalars)', () => collect(nums).keys().all(), () => lazy(nums).keys().all()],

  // ── Set operations ────────────────────────────────────────────────────────
  ['diff', () => collect(nums).diff([1, 9, 2]).all(), () => lazy(nums).diff([1, 9, 2]).all()],
  [
    'diff(Collection)',
    () =>
      collect(nums)
        .diff(collect([1, 9]))
        .all(),
    () =>
      lazy(nums)
        .diff(collect([1, 9]))
        .all()
  ],
  [
    'diffAssoc',
    () =>
      collect([{ a: 1, b: 2 }])
        .diffAssoc([{ a: 1, b: 99 }])
        .all(),
    () =>
      lazy([{ a: 1, b: 2 }])
        .diffAssoc([{ a: 1, b: 99 }])
        .all()
  ],
  [
    'diffKeys',
    () =>
      collect([{ a: 1, b: 2 }])
        .diffKeys(['a'])
        .all(),
    () =>
      lazy([{ a: 1, b: 2 }])
        .diffKeys(['a'])
        .all()
  ],
  [
    'intersect',
    () => collect(nums).intersect([1, 5, 42]).all(),
    () => lazy(nums).intersect([1, 5, 42]).all()
  ],
  [
    'intersectAssoc',
    () =>
      collect([{ a: 1, b: 2 }])
        .intersectAssoc([{ a: 1, b: 99 }])
        .all(),
    () =>
      lazy([{ a: 1, b: 2 }])
        .intersectAssoc([{ a: 1, b: 99 }])
        .all()
  ],
  [
    'intersectByKeys',
    () =>
      collect([{ a: 1, b: 2 }])
        .intersectByKeys(['b'])
        .all(),
    () =>
      lazy([{ a: 1, b: 2 }])
        .intersectByKeys(['b'])
        .all()
  ],
  ['union', () => collect([1, 2]).union([2, 3]).all(), () => lazy([1, 2]).union([2, 3]).all()],
  [
    'union(LazyCollection other)',
    () => collect([1, 2]).union([2, 3]).all(),
    () =>
      lazy([1, 2])
        .union(lazy([2, 3]))
        .all()
  ],
  [
    'crossJoin',
    () => collect<unknown>([1, 2]).crossJoin(['a', 'b']).all(),
    () => lazy<unknown>([1, 2]).crossJoin(['a', 'b']).all()
  ],
  [
    'duplicates',
    () => collect(['x', 'y', 'x']).duplicates(),
    () => lazy(['x', 'y', 'x']).duplicates()
  ],
  [
    'duplicatesStrict',
    () => collect<unknown>([1, '1', 1]).duplicatesStrict(),
    () => lazy<unknown>([1, '1', 1]).duplicatesStrict()
  ],
  ['only', () => collect(people).only(['name']).all(), () => lazy(people).only(['name']).all()],
  [
    'except',
    () => collect(people).except(['tags', 'active', 'age']).all(),
    () => lazy(people).except(['tags', 'active', 'age']).all()
  ],
  ['flip', () => collect(['a', 'b']).flip().all(), () => lazy(['a', 'b']).flip().all()],
  ['pad', () => collect([1]).pad(3, 0).all(), () => lazy([1]).pad(3, 0).all()],
  ['pad negative', () => collect([1]).pad(-3, 0).all(), () => lazy([1]).pad(-3, 0).all()],
  ['multiply', () => collect([1, 2]).multiply(2).all(), () => lazy([1, 2]).multiply(2).all()],
  ['combine', () => collect(['a', 'b']).combine([1, 2]), () => lazy(['a', 'b']).combine([1, 2])],
  [
    'combine(Collection values)',
    () => collect(['a', 'b']).combine(collect([1, 2])),
    () => lazy(['a', 'b']).combine(collect([1, 2]))
  ],
  [
    'zip',
    () => collect([1, 2, 3]).zip(['a', 'b']).all(),
    () => lazy([1, 2, 3]).zip(['a', 'b']).all()
  ],
  ['concat', () => collect([1]).concat([2, 3]).all(), () => lazy([1]).concat([2, 3]).all()],
  [
    'concat(LazyCollection)',
    () => collect([1]).concat([2]).all(),
    () =>
      lazy([1])
        .concat(lazy([2]))
        .all()
  ],
  [
    'merge assoc single objects',
    () =>
      collect([{ a: 1, b: 2 }])
        .merge([{ b: 9, c: 3 }])
        .all(),
    () =>
      lazy([{ a: 1, b: 2 }])
        .merge([{ b: 9, c: 3 }])
        .all()
  ],
  [
    'merge lists append',
    () => collect([1, 2]).merge([3]).all(),
    () => lazy([1, 2]).merge([3]).all()
  ],

  // ── Reduction & strings ───────────────────────────────────────────────────
  [
    'reduce',
    () => collect(nums).reduce((acc, n) => acc + n, 0),
    () => lazy(nums).reduce((acc, n) => acc + n, 0)
  ],
  ['implode(glue)', () => collect(nums).implode('-'), () => lazy(nums).implode('-')],
  [
    'implode(glue, key)',
    () => collect(people).implode(',', 'name'),
    () => lazy(people).implode(',', 'name')
  ],
  [
    'implode(formatter, separator)',
    () => collect([1, 2]).implode((n) => `#${n}`, '|'),
    () => lazy([1, 2]).implode((n) => `#${n}`, '|')
  ],
  ['join', () => collect(['a', 'b', 'c']).join(', '), () => lazy(['a', 'b', 'c']).join(', ')],
  [
    'join with finalGlue',
    () => collect(['a', 'b', 'c']).join(', ', ' and '),
    () => lazy(['a', 'b', 'c']).join(', ', ' and ')
  ]
]

describe('LazyCollection parity with eager Collection (audit: zero-coverage method surface)', () => {
  it.each(cases)('%s matches the eager result', (_name, eager, lazyRun) => {
    expect(norm(lazyRun())).toEqual(norm(eager()))
  })

  it('empty-input rows behave identically for representative methods', () => {
    expect(lazy<number>([]).sum()).toBe(collect<number>([]).sumBy())
    expect(lazy<number>([]).max()).toBeUndefined()
    expect(lazy<number>([]).median()).toBeUndefined()
    expect(lazy<number>([]).mode()).toBeUndefined()
    expect(norm(lazy<number>([]).chunk(3))).toEqual(norm(collect<number>([]).chunk(3)))
    expect(lazy<number>([]).implode('-')).toBe('')
    expect(lazy<number>([]).keys().all()).toEqual([])
  })
})

describe('LazyCollection terminal/behavioral methods', () => {
  it('firstOrFail throws ItemNotFoundException when nothing matches', () => {
    expect(() => lazy<number>([]).firstOrFail()).toThrow(ItemNotFoundException)
    expect(() => lazy([1, 2]).firstOrFail((n) => n > 5)).toThrow(ItemNotFoundException)
  })

  it('random returns undefined on empty and a member otherwise', () => {
    expect(lazy<number>([]).random()).toBeUndefined()
    const picked = lazy(nums).random()
    expect(nums).toContain(picked)
  })

  it('each visits items with indices and stops on false', () => {
    const seen: Array<[number, number]> = []
    const l = lazy(nums)
    const returned = l.each((item, i) => {
      seen.push([i, item])
      return i === 2 ? false : undefined
    })
    expect(returned).toBe(l)
    expect(seen).toEqual([
      [0, 3],
      [1, 1],
      [2, 4]
    ])
  })

  it('pipe / pipeInto / pipeThrough / tap mirror the eager fluency', () => {
    expect(lazy(nums).pipe((c) => c.count())).toBe(nums.length)

    const boxed = lazy(nums).pipeInto(Box)
    expect(boxed).toBeInstanceOf(Box)
    expect(boxed.inner.all()).toEqual(nums)

    const result = lazy([1, 2, 3]).pipeThrough([
      (c) => (c as LazyCollection<number>).sum(),
      (n) => (n as number) * 10
    ])
    expect(result).toBe(60)

    let tapped: number[] = []
    const l = lazy([1, 2])
    expect(l.tap((c) => (tapped = c.all()))).toBe(l)
    expect(tapped).toEqual([1, 2])
  })

  it('when/unless family invokes callbacks based on the condition', () => {
    const calls: string[] = []
    const l = lazy([1, 2, 3])

    l.when(true, () => void calls.push('when-true'))
    l.when(
      false,
      () => void calls.push('nope'),
      () => void calls.push('when-fallback')
    )
    l.when(
      (c) => c.count() === 3,
      () => void calls.push('when-fn')
    )
    l.unless(false, () => void calls.push('unless-false'))
    l.unless(
      (c) => c.count() > 5,
      () => void calls.push('unless-fn')
    )
    l.whenEmpty(
      () => void calls.push('nope'),
      () => void calls.push('whenEmpty-fallback')
    )
    l.whenNotEmpty(() => void calls.push('whenNotEmpty'))
    l.unlessEmpty(() => void calls.push('unlessEmpty'))
    l.unlessNotEmpty(() => void calls.push('nope'))
    lazy([]).unlessNotEmpty(() => void calls.push('unlessNotEmpty-empty'))

    expect(calls).toEqual([
      'when-true',
      'when-fallback',
      'when-fn',
      'unless-false',
      'unless-fn',
      'whenEmpty-fallback',
      'whenNotEmpty',
      'unlessEmpty',
      'unlessNotEmpty-empty'
    ])
  })

  it('when returns the callback result when one is produced', () => {
    const l = lazy([1, 2])
    const swapped = lazy([9])
    expect(l.when(true, () => swapped)).toBe(swapped)
    expect(l.when(false, () => swapped)).toBe(l)
  })
})

describe('LazyCollection residual branches', () => {
  it('has a LazyCollection toStringTag', () => {
    expect(Object.prototype.toString.call(lazy([1]))).toBe('[object LazyCollection]')
  })

  it('is directly iterable via Symbol.iterator', () => {
    const out: number[] = []
    for (const v of lazy([1, 2])) out.push(v)
    expect(out).toEqual([1, 2])
  })

  it('firstWhere returns undefined when nothing matches', () => {
    expect(lazy(people).firstWhere('role', 'ghost')).toBeUndefined()
  })

  it('take(0) yields nothing without pulling from the source', () => {
    let pulls = 0
    const l = lazy(function* (): Generator<number> {
      pulls++
      yield 1
    })
    expect(l.take(0).all()).toEqual([])
    expect(pulls).toBe(0)
  })

  it('flatten descends into plain objects lazily', () => {
    expect(
      lazy<unknown>([{ a: 1, b: { c: 2 } }, 3])
        .flatten()
        .all()
    ).toEqual([1, 2, 3])
  })

  it('implode with a formatter and no separator concatenates directly', () => {
    expect(lazy([1, 2]).implode((n) => `#${n}`)).toBe('#1#2')
  })

  it('takeUntilTimeout accepts an epoch-millis number deadline', () => {
    expect(
      lazy([1, 2, 3])
        .takeUntilTimeout(Date.now() + 60_000)
        .all()
    ).toEqual([1, 2, 3])
    expect(
      lazy([1, 2, 3])
        .takeUntilTimeout(Date.now() - 1)
        .all()
    ).toEqual([])
  })

  it('static range throws on a zero step when consumed', () => {
    expect(() => LazyCollection.range(1, 5, 0).all()).toThrow(RangeError)
  })
})

describe('LazyCollection static factories (audit: wrap/unwrap/empty/times untested)', () => {
  it('make wraps an iterable lazily', () => {
    expect(LazyCollection.make([1, 2]).all()).toEqual([1, 2])
    expect(LazyCollection.make().all()).toEqual([])
  })

  it('empty yields nothing', () => {
    expect(LazyCollection.empty().all()).toEqual([])
  })

  it('range supports ascending and descending sequences', () => {
    expect(LazyCollection.range(1, 4).all()).toEqual([1, 2, 3, 4])
    expect(LazyCollection.range(3, 1, -1).all()).toEqual([3, 2, 1])
  })

  it('times builds from a 1-based factory', () => {
    expect(LazyCollection.times(3, (n) => n * 2).all()).toEqual([2, 4, 6])
  })

  it('wrap returns the same instance for a LazyCollection', () => {
    const l = lazy([1])
    expect(LazyCollection.wrap(l)).toBe(l)
  })

  it('wrap handles null, iterables, and scalars', () => {
    expect(LazyCollection.wrap<number>(null).all()).toEqual([])
    expect(LazyCollection.wrap(undefined).all()).toEqual([])
    expect(LazyCollection.wrap([1, 2]).all()).toEqual([1, 2])
    expect(LazyCollection.wrap(new Set([1, 2])).all()).toEqual([1, 2])
    expect(LazyCollection.wrap(7).all()).toEqual([7])
  })

  it('unwrap extracts the underlying items', () => {
    expect(LazyCollection.unwrap(lazy([1, 2]))).toEqual([1, 2])
    expect(LazyCollection.unwrap([3])).toEqual([3])
    expect(LazyCollection.unwrap(9)).toBe(9)
  })
})
