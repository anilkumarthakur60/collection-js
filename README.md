# @anilkumarthakur/collection-js

A fluent, Laravel-inspired Collection library for JavaScript and TypeScript. Full parity with the **Laravel 13.x Collections** API — plus statistics, SQL-style joins, combinatorics, async streams, and CSV/JSONL I/O that go beyond it.

[![npm version](https://img.shields.io/npm/v/@anilkumarthakur/collection-js)](https://www.npmjs.com/package/@anilkumarthakur/collection-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- **Strict TypeScript** — written in strict mode with deep type inference; no `any` in the public surface.
- **Immutable by default** — methods return new collections; the handful of mutators mirror Laravel exactly.
- **Three flavours** — eager `Collection`, generator-backed `LazyCollection`, and `AsyncCollection` for `AsyncIterable` sources.
- **Tree-shakable** — every operation is also a standalone pure function you can import directly.
- **Zero runtime dependencies.**

## Installation

```bash
npm install @anilkumarthakur/collection-js
```

## Quick Start

```typescript
import collect from '@anilkumarthakur/collection-js'

collect([1, 2, 3, 4, 5])
  .filter((item) => item > 2)
  .map((item) => item * 10)
  .all()
// => [30, 40, 50]
```

## Working with Objects

```typescript
const users = collect([
  { id: 1, name: 'Alice', role: 'admin', score: 95 },
  { id: 2, name: 'Bob', role: 'user', score: 80 },
  { id: 3, name: 'Charlie', role: 'admin', score: 92 },
  { id: 4, name: 'Diana', role: 'user', score: 88 }
])

users.where('role', 'admin').sortByDesc('score').pluck('name').all()
// => ['Alice', 'Charlie']

users.groupBy('role')
// => { admin: [...], user: [...] }

users.avg('score') // => 88.75
users.max('score') // => 95
users.median('score') // => 90

const [admins, regular] = users.partition((u) => u.role === 'admin')
```

`where`-style filters support dot-notation paths and comparison operators, and `max`/`min` work on numbers, strings, and `Date`s:

```typescript
collect(['banana', 'apple', 'cherry']).max() // => 'cherry'
collect(orders).where('customer.country', 'FR').sum('total')
```

### Pattern filtering with `whereLike`

`whereLike` / `whereNotLike` filter by an SQL-`LIKE` pattern, where `%` matches any run of characters and `_` matches a single one (case-insensitive by default):

```typescript
collect(users).whereLike('name', '%Smith') // ends with "Smith"
collect(users).whereLike('email', '%@gmail.com') // gmail addresses
collect(users).whereNotLike('name', 'A%', true) // case-sensitive: not starting with "A"
```

## Lazy Collections

For large or infinite datasets, use generator-backed lazy evaluation — values are produced on demand:

```typescript
import { LazyCollection } from '@anilkumarthakur/collection-js'

new LazyCollection(function* () {
  for (let i = 0; i < 1_000_000; i++) yield i
})
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .take(5)
  .toArray()
// => [0, 4, 8, 12, 16] — only 5 items ever evaluated
```

Lazy-only helpers: `tapEach`, `remember` (memoize pulled values), `takeUntilTimeout`, `throttle`, `withHeartbeat`.

## Async Collections

Stream and transform `AsyncIterable` sources with bounded concurrency:

```typescript
import { AsyncCollection } from '@anilkumarthakur/collection-js'

const results = await AsyncCollection.from(userIds)
  .mapAsync((id) => fetchUser(id), { concurrency: 8 }) // ≤ 8 in flight, source order preserved
  .filter((user) => user.active)
  .take(100)
  .toArray()
```

## Beyond Laravel

These extend the Laravel API for real-world data work:

**Statistics** — `variance` · `sampleVariance` · `stddev` · `sampleStddev` · `quantile` · `percentileAt` · `histogram` · `correlation`

```typescript
collect(samples).stddev('latency')
collect(rows).correlation('spend', 'revenue')
collect(values).histogram(10)
```

**SQL-style joins** — `joinOn` (inner) · `leftJoin` · `rightJoin` · `outerJoin`

```typescript
collect(orders).joinOn(customers, 'customerId', 'id', (order, customer) => ({
  ...order,
  customerName: customer.name
}))
```

**Combinatorics & itertools** — `scan` · `pairwise` · `enumerate` · `cycle` · `interleave` · `permutations` · `combinations` · `powerSet`

```typescript
collect([1, 2, 3]).permutations().all() // all 3! orderings
collect([1, 2, 3, 4]).combinations(2).all()
collect([1, 2, 3])
  .scan((sum, n) => sum + n, 0)
  .all() // running totals: [1, 3, 6]
```

**CSV / JSONL / streams**

```typescript
import { parseCsv, toCsv, parseJsonl, toJsonl, lines } from '@anilkumarthakur/collection-js'

const rows = collect(parseCsv(csvText, { header: true }))
const csv = toCsv(rows.all())
```

## Higher-Order Messages

```typescript
users.sum.score // => 355   (property-style)
users.where('role', 'admin').each.notify()
```

## Extending with Macros

Add your own methods at runtime — they participate in chaining like built-ins:

```typescript
import { Collection } from '@anilkumarthakur/collection-js'

Collection.macro('toUpper', function (this: Collection<string>) {
  return this.map((s) => s.toUpperCase())
})

collect(['a', 'b']).toUpper().all() // => ['A', 'B']
```

## Available Methods

<details>
<summary>Click to expand the full method list</summary>

### Creation

`make` · `collect` · `fromJson` · `fromEntries` · `fromMap` · `fromSet` · `times` · `range` · `wrap` · `unwrap` · `empty` · `lazy`

### Filtering

`filter` · `reject` · `where` · `whereStrict` · `whereBetween` · `whereNotBetween` · `whereIn` · `whereInStrict` · `whereNotIn` · `whereNotInStrict` · `whereNull` · `whereNotNull` · `whereLike` · `whereNotLike` · `whereInstanceOf` · `compact` · `first` · `firstOrFail` · `firstWhere` · `last` · `sole` · `unique` · `uniqueStrict` · `except` · `only` · `select`

### Transformation

`map` · `mapInto` · `mapSpread` · `mapToGroups` · `mapWithKeys` · `flatMap` · `flatten` · `collapse` · `collapseWithKeys` · `chunk` · `chunkWhile` · `sliding` · `split` · `splitIn` · `dot` · `undot` · `flip` · `pluck` · `values` · `keys` · `zip` · `combine` · `crossJoin`

### Aggregation

`sum` · `average` / `avg` · `min` · `max` · `minBy` · `maxBy` · `median` · `mode` · `count` · `countBy` · `percentage`

### Statistics

`variance` · `sampleVariance` · `stddev` · `sampleStddev` · `quantile` · `percentileAt` · `histogram` · `correlation`

### Joins

`joinOn` · `leftJoin` · `rightJoin` · `outerJoin`

### Itertools & combinatorics

`scan` · `pairwise` · `enumerate` · `cycle` · `interleave` · `permutations` · `combinations` · `powerSet`

### Sorting

`sort` · `sortBy` · `sortByDesc` · `sortDesc` · `sortKeys` · `sortKeysDesc` · `sortKeysUsing` · `reverse` · `shuffle`

### Searching

`contains` · `containsStrict` · `containsOneItem` · `doesntContain` · `doesntContainStrict` · `search` · `has` · `hasAny` · `hasMany` · `hasSole` · `every` · `some`

### Iteration

`each` · `eachSpread` · `tap` · `tapEach` · `transform` · `pipe` · `pipeInto` · `pipeThrough`

### Addition & Removal

`push` · `prepend` · `concat` · `merge` · `mergeRecursive` · `union` · `diff` · `diffAssoc` · `diffAssocUsing` · `diffKeys` · `intersect` · `intersectUsing` · `intersectAssoc` · `intersectAssocUsing` · `intersectByKeys` · `pop` · `shift` · `pull` · `forget` · `splice`

### Partitioning

`partition` · `groupBy` · `groupByMany` · `keyBy` · `take` · `takeUntil` · `takeWhile` · `skip` · `skipUntil` · `skipWhile` · `slice` · `forPage` · `nth` · `after` · `before`

### Conditional

`when` · `whenEmpty` · `whenNotEmpty` · `unless` · `unlessEmpty` · `unlessNotEmpty`

### Conversion

`all` · `toArray` · `toJson` · `toPrettyJson` · `toMap` · `toSet` · `implode` · `join` · `dump` · `dd`

### Misc

`collect` · `clone` · `macro` · `ensure` · `pad` · `multiply` · `random` · `reduce` · `reduceSpread` · `value` · `isEmpty` · `isNotEmpty` · `duplicates` · `duplicatesStrict` · `put` · `get` · `replace` · `replaceRecursive`

### Lazy-only

`remember` · `tapEach` · `takeUntilTimeout` · `throttle` · `withHeartbeat`

### Async (`AsyncCollection`)

`map` · `mapAsync` · `filter` · `filterAsync` · `flatMap` · `take` · `skip` · `takeWhile` · `skipWhile` · `chunk` · `tap` · `forEach` · `eachAsync` · `reduce` · `first` · `last` · `every` · `some` · `count` · `toArray` · `collect`

### I/O

`parseCsv` · `toCsv` · `parseJsonl` · `parseJsonlStream` · `toJsonl` · `fromReadable` · `lines`

</details>

## Laravel Compatibility

This library aims for full API parity with [Laravel 13.x Collections](https://laravel.com/docs/13.x/collections). If you're familiar with Laravel's `Collection` class, you'll feel right at home — `collect()` is the default export.

## License

[MIT](LICENSE)
