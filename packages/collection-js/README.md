# @anil-labs/collection-js

A fluent, Laravel-inspired Collection library for JavaScript and TypeScript. Near-complete parity with the **Laravel 13.x Collections** API (see [Laravel Compatibility](#laravel-compatibility) for the gaps)  plus statistics, SQL-style joins, combinatorics, async streams, and CSV/JSONL I/O that go beyond it.

[![npm version](https://img.shields.io/npm/v/@anil-labs/collection-js)](https://www.npmjs.com/package/@anil-labs/collection-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

- **Strict TypeScript**  written in strict mode with deep type inference; no `any` in the public surface.
- **Immutable by default**  methods return new collections; the handful of mutators mirror Laravel exactly.
- **Three flavours**  eager `Collection`, generator-backed `LazyCollection`, and `AsyncCollection` for `AsyncIterable` sources.
- **Standalone operations**  every method is also a pure function (`operations.pluckOf(...)`), usable without the `Collection` class.
- **Runs anywhere**  Node 18+, any framework, or straight off a CDN as a single `<script>` tag.
- **Zero runtime dependencies.**

## Installation

```bash
npm install @anil-labs/collection-js
```

Requires Node.js 18+  or no Node at all: the package ships a browser-ready global build, so a single script tag works with no bundler and no build step:

```html
<script src="https://unpkg.com/@anil-labs/collection-js"></script>
<script>
  const { collect } = CollectionJS
  collect([1, 2, 3]).sum() // => 6
</script>
```

See the [CDN usage guide](https://github.com/anilkumarthakur60/collection-js/blob/main/docs/guide/cdn.md) (runnable demo in [`examples/cdn`](https://github.com/anilkumarthakur60/collection-js/tree/main/examples/cdn)).

## Quick Start

```typescript
import collect from '@anil-labs/collection-js'

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

const byRole = users.groupBy('role')
// => { admin: Collection, user: Collection }  each group stays chainable
byRole['admin'].pluck('name').all() // => ['Alice', 'Charlie']

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

For large or infinite datasets, use generator-backed lazy evaluation  values are produced on demand:

```typescript
import { LazyCollection } from '@anil-labs/collection-js'

new LazyCollection(function* () {
  for (let i = 0; i < 1_000_000; i++) yield i
})
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .take(5)
  .toArray()
// => [0, 4, 8, 12, 16]  only 5 items ever evaluated
```

Lazy-only helpers: `tapEach`, `remember` (memoize pulled values), `takeUntilTimeout`, `throttle`, `withHeartbeat`.

## Async Collections

Stream and transform `AsyncIterable` sources with bounded concurrency:

```typescript
import { AsyncCollection } from '@anil-labs/collection-js'

const results = await AsyncCollection.from(userIds)
  .mapAsync((id) => fetchUser(id), { concurrency: 8 }) // ≤ 8 in flight, source order preserved
  .filter((user) => user.active)
  .take(100)
  .toArray()
```

## Beyond Laravel

These extend the Laravel API for real-world data work:

**Statistics**  `variance` · `sampleVariance` · `stddev` · `sampleStddev` · `quantile` · `percentileAt` · `histogram` · `correlation`

```typescript
collect(samples).stddev('latency')
collect(rows).correlation('spend', 'revenue')
collect(values).histogram(10)
```

**SQL-style joins**  `joinOn` (inner) · `leftJoin` · `rightJoin` · `outerJoin`

```typescript
collect(orders).joinOn(customers, 'customerId', 'id', (order, customer) => ({
  ...order,
  customerName: customer.name
}))
```

**Combinatorics & itertools**  `scan` · `pairwise` · `enumerate` · `cycle` · `interleave` · `permutations` · `combinations` · `powerSet`

```typescript
collect([1, 2, 3]).permutations().all() // all 3! orderings
collect([1, 2, 3, 4]).combinations(2).all()
collect([1, 2, 3])
  .scan((sum, n) => sum + n, 0)
  .all() // running totals: [1, 3, 6]
```

**CSV / JSONL / streams**

```typescript
import { parseCsv, toCsv, parseJsonl, toJsonl, lines } from '@anil-labs/collection-js'

const rows = collect(parseCsv(csvText, { header: true }))
const csv = toCsv(rows.all())
```

## Higher-Order Messages

Every method in `HIGHER_ORDER_TARGETS` (`each`, `map`, `filter`, `sum`, `avg`, `max`, `min`, `groupBy`, `sortBy`, `unique`, …) also accepts its callback as a **property access**, on both `Collection` and `LazyCollection`:

```typescript
users.sum.score // => 355    property form of users.sum((u) => u.score)
users.map.name.all() // => ['Alice', 'Bob', 'Charlie', 'Diana']
users.where('role', 'admin').each.notify() // calls notify() on every admin
```

## Extending with Macros

Add your own methods at runtime  they participate in chaining like built-ins:

```typescript
import { Collection } from '@anil-labs/collection-js'

Collection.macro('toUpper', function (this: Collection<string>) {
  return this.map((s) => s.toUpperCase())
})

collect(['a', 'b']).toUpper().all() // => ['A', 'B']
```

## Laravel Compatibility

This library tracks [Laravel 13.x Collections](https://laravel.com/docs/13.x/collections) closely  `collect()` is the default export and the overwhelming majority of methods match Laravel's names and behavior, so if you know Laravel's `Collection` you'll feel right at home.

Parity is near-complete rather than total. Known gaps and deliberate divergences:

- **Not implemented (yet):** `getOrPut`, `mapToDictionary`, `diffUsing`, `diffKeysUsing`.
- **Keyed results are plain objects.** A collection always wraps an array, so `groupBy`, `keyBy`, `countBy`, `mapWithKeys`, `mapToGroups`, `combine`, `dot`, and `duplicates` return a `Record` rather than a keyed Collection. The group values of `groupBy`/`mapToGroups` are chainable `Collection`s.
- **`get(index)` is index-based** (negative indices count from the end). For Laravel's key-based `get($key)`, use `value(key)` or `dataGet`.
- **`put(key, value)` sets the key on every object element** (mutating in place), rather than setting a single keyed entry.
- **`has(key)` checks item properties**, not collection keys.
- **`avg()`/`average()` of an empty collection returns `0`** (Laravel returns `null`), and non-numeric values are skipped rather than coerced.
- **`combine()` truncates to the shorter side** on a length mismatch (Laravel throws).

Smaller signature differences are called out per-method in the [API reference](https://github.com/anilkumarthakur60/collection-js/blob/main/docs/api/index.md).

## Repository & Development

Source, issues, and the full documentation live in the monorepo:

- **Repository:** https://github.com/anilkumarthakur60/collection-js
- **Documentation:** [`docs`](https://github.com/anilkumarthakur60/collection-js/tree/main/docs) (a VitePress site)
- **Playground:** [`examples/playground`](https://github.com/anilkumarthakur60/collection-js/tree/main/examples/playground)  Vite + TypeScript, wired to the workspace build
- **CDN demo:** [`examples/cdn`](https://github.com/anilkumarthakur60/collection-js/tree/main/examples/cdn)  no-bundler demo of the global build

## License

[MIT](https://github.com/anilkumarthakur60/collection-js/blob/main/LICENSE)
