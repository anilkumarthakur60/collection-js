# @anilkumarthakur/collection-js

A fluent, Laravel-inspired Collection library for JavaScript and TypeScript. Provides **120+ chainable methods** for elegant array manipulation.

[![npm version](https://img.shields.io/npm/v/@anilkumarthakur/collection-js)](https://www.npmjs.com/package/@anilkumarthakur/collection-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

```bash
npm install @anilkumarthakur/collection-js
```

## Quick Start

```typescript
import collect from '@anilkumarthakur/collection-js'

// Create a collection
const collection = collect([1, 2, 3, 4, 5])

// Chain methods fluently
collection
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

// Filter, sort, and pluck
users.where('role', 'admin').sortByDesc('score').pluck('name').all()
// => ['Alice', 'Charlie']

// Group by a key
users.groupBy('role')
// => { admin: [...], user: [...] }

// Aggregate
users.average((u) => u.score) // => 88.75
users.sum((u) => u.score) // => 355
users.median((u) => u.score) // => 90

// Partition into two groups
const [admins, regular] = users.partition((u) => u.role === 'admin')
```

## Lazy Collections

For large datasets, use lazy evaluation with generators:

```typescript
import { LazyCollection } from '@anilkumarthakur/collection-js'

const lazy = new LazyCollection(function* () {
  for (let i = 0; i < 1_000_000; i++) yield i
})

lazy
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .take(5)
  .toArray()
// => [0, 4, 8, 12, 16] — only 5 items evaluated
```

## Available Methods

<details>
<summary>Click to expand full method list (120+ methods)</summary>

### Creation

`make` · `collect` · `fromJson` · `times` · `wrap` · `unwrap` · `range`

### Filtering

`filter` · `reject` · `where` · `whereStrict` · `whereBetween` · `whereNotBetween` · `whereIn` · `whereInStrict` · `whereNotIn` · `whereNotInStrict` · `whereNull` · `whereNotNull` · `whereInstanceOf` · `first` · `firstOrFail` · `firstWhere` · `last` · `sole` · `unique` · `uniqueStrict` · `except` · `only` · `select`

### Transformation

`map` · `mapInto` · `mapSpread` · `mapToGroups` · `mapWithKeys` · `flatMap` · `flatten` · `collapse` · `collapseWithKeys` · `chunk` · `chunkWhile` · `sliding` · `split` · `splitIn` · `dot` · `undot` · `flip` · `pluck` · `values` · `keys` · `zip` · `combine` · `crossJoin`

### Aggregation

`sum` · `average` / `avg` · `min` · `max` · `median` · `mode` · `count` · `countBy` · `percentage`

### Sorting

`sort` · `sortBy` · `sortByDesc` · `sortDesc` · `sortKeys` · `sortKeysDesc` · `sortKeysUsing`

### Searching

`contains` · `containsStrict` · `containsOneItem` · `doesntContain` · `doesntContainStrict` · `search` · `has` · `hasAny` · `hasMany` · `hasSole` · `every` · `some`

### Iteration

`each` · `eachSpread` · `tap` · `transform` · `pipe` · `pipeInto` · `pipeThrough`

### Addition & Removal

`push` · `prepend` · `concat` · `merge` · `mergeRecursive` · `union` · `diff` · `diffAssoc` · `diffAssocUsing` · `diffKeys` · `intersect` · `intersectUsing` · `intersectAssoc` · `intersectAssocUsing` · `intersectByKeys` · `pop` · `shift` · `pull` · `forget` · `splice`

### Partitioning

`partition` · `groupBy` · `keyBy` · `take` · `takeUntil` · `takeWhile` · `skip` · `skipUntil` · `skipWhile` · `slice` · `forPage` · `nth` · `after` · `before`

### Conditional

`when` · `whenEmpty` · `whenNotEmpty` · `unless` · `unlessEmpty` · `unlessNotEmpty`

### Conversion

`all` · `toArray` · `toJson` · `toPrettyJson` · `implode` · `join` · `dump` · `dd`

### Misc

`collect` · `lazy` · `macro` · `ensure` · `pad` · `multiply` · `random` · `reverse` · `shuffle` · `wrap` · `isEmpty` · `isNotEmpty` · `duplicates` · `duplicatesStrict` · `put` · `get` · `replace` · `replaceRecursive` · `reduce` · `reduceSpread` · `value` · `times`

</details>

## Laravel Compatibility

This library is inspired by and aims for full API parity with [Laravel 13.x Collections](https://laravel.com/docs/13.x/collections). If you're familiar with Laravel's Collection class, you'll feel right at home.

## License

[MIT](LICENSE)
