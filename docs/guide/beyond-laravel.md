# Beyond Laravel

In addition to full parity with Laravel 13.x Collections, this library ships features tuned for real-world data work in JavaScript and TypeScript. Everything below is fully typed and chainable.

## Statistics

Numeric summaries that go past `sum`/`avg`/`median`. Each accepts an optional key or callback to select the value, and returns `undefined` for empty input (sample variants require at least two values).

| Method                      | Description                                         |
| --------------------------- | --------------------------------------------------- |
| `variance(by?)`             | Population variance (÷ N)                           |
| `sampleVariance(by?)`       | Sample variance (÷ N−1)                             |
| `stddev(by?)`               | Population standard deviation                       |
| `sampleStddev(by?)`         | Sample standard deviation                           |
| `quantile(q, by?)`          | Quantile for `q` in `[0, 1]` (linear interpolation) |
| `percentileAt(p, by?)`      | Percentile for `p` in `[0, 100]`                    |
| `histogram(bins, options?)` | Equal-width histogram buckets                       |
| `correlation(xBy, yBy)`     | Pearson correlation between two extractors          |

```typescript
collect(requests).stddev('latencyMs')
collect(samples).quantile(0.95, 'duration')
collect(data).histogram(10, { range: [0, 100] })
collect(rows).correlation('adSpend', 'revenue')
```

## SQL-style Joins

Relational joins between two collections, keyed by a property or callback on each side. Pass an optional `merge` callback to shape each matched row; otherwise tuples are produced.

```typescript
const orders = collect([{ id: 1, customerId: 10 }])
const customers = [{ id: 10, name: 'Acme' }]

orders.joinOn(customers, 'customerId', 'id', (order, customer) => ({
  ...order,
  customer: customer.name
}))
// => [{ id: 1, customerId: 10, customer: 'Acme' }]
```

- `joinOn` — inner join (only matched pairs)
- `leftJoin` — every left row; unmatched right is `undefined`
- `rightJoin` — every right row; unmatched left is `undefined`
- `outerJoin` — every left and right row appears at least once

## Itertools & Combinatorics

```typescript
collect([1, 2, 3])
  .scan((sum, n) => sum + n, 0)
  .all() // running totals: [1, 3, 6]
collect([1, 2, 3, 4]).pairwise().all() // [[1,2],[2,3],[3,4]]
collect(['a', 'b']).enumerate().all() // [[0,'a'],[1,'b']]
collect([1, 2]).cycle(3).all() // [1,2,1,2,1,2]
collect([1, 2]).interleave([3, 4]).all() // [1,3,2,4]
collect([1, 2, 3]).permutations().all() // all 3! orderings
collect([1, 2, 3, 4]).combinations(2).all() // every 2-element subset
collect([1, 2]).powerSet().all() // [[],[1],[2],[1,2]]
```

> `cycle(Infinity)` is only available on a `LazyCollection` — call `.lazy().cycle()` for an unbounded stream and bound it with `take`.

## Async Collections

`AsyncCollection` mirrors the lazy API for `AsyncIterable` sources, with bounded-parallelism `mapAsync` / `filterAsync` / `eachAsync`. Concurrent operators preserve source order.

```typescript
import { AsyncCollection } from '@anil-labs/collection-js'

const active = await AsyncCollection.from(userIds)
  .mapAsync((id) => fetchUser(id), { concurrency: 8 })
  .filter((user) => user.active)
  .take(100)
  .toArray()
```

## CSV / JSONL / Streams

```typescript
import {
  parseCsv,
  toCsv,
  parseJsonl,
  parseJsonlStream,
  toJsonl,
  fromReadable,
  lines
} from '@anil-labs/collection-js'

// CSV ⇄ objects (RFC 4180 quoting handled)
const rows = collect(parseCsv(csvText, { header: true }))
const csv = toCsv(rows.all())

// JSONL
const records = collect(parseJsonl(jsonlText))

// Node streams → line-by-line AsyncCollection
for await (const line of lines(process.stdin)) {
  // ...
}
```

## Lazy-only Helpers

`LazyCollection` adds operators that only make sense for on-demand evaluation:

- `remember()` — memoize values already pulled so re-iteration replays from cache
- `tapEach(fn)` — side effects fired as items flow through
- `takeUntilTimeout(deadline)` — stop enumerating at a `Date`/epoch-ms
- `throttle(seconds)` — async-iterate one value per interval
- `withHeartbeat(intervalMs, fn)` — run `fn` periodically while enumerating (extend locks, post progress)
