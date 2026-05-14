# API Reference

The `Collection` class provides 150+ chainable methods for elegant array manipulation, plus statistics, SQL-style joins, combinatorics, async streams, and CSV/JSONL I/O (see [Beyond Laravel](/guide/beyond-laravel)).

::: tip Immutability
Almost all methods return a **new** Collection instance — the original is not mutated. The few in-place mutators are noted below (`push`, `prepend`, `pop`, `shift`, `pull`, `forget`, `splice`, `transform`, `put`). Call `.all()` or `.toArray()` to extract the underlying array.
:::

::: warning Data model — read this first
A collection always wraps an **array**. There is no separate "associative array" type:

- A "dictionary" is just an object stored as a collection element. To work with one object, wrap it in an array: `collect([{ id: 1, name: 'Ada' }])`.
- `all()` / `toArray()` therefore always return an **array** (e.g. `[{ ... }]`), never a bare object.
- Methods that reduce to a keyed structure — `groupBy`, `keyBy`, `countBy`, `mapWithKeys`, `mapToGroups`, `combine`, `dot`, `duplicates`, `duplicatesStrict`, `pluck(value, key)` — are **terminal** and return a plain object/`Record` directly (no `.all()`).
- `get(index)` takes a numeric index (not an object key); `pull(value)` removes by value. For object-key lookups use `dataGet`, or plain property access on the element.
- Object-comparison arguments (`merge`, `diff*`, `intersect*`, `replace*`) must be **arrays/collections**, not bare objects.

:::

## Creation

- **`collect(items)`**: The default helper for instantiating a Collection from an iterable/array-like.
- **`make(items)`**: Static alias of `collect`.
- **`Collection.fromJson(json)`** _(static)_: Creates a Collection from a JSON string (an object is wrapped as a single element).
- **`Collection.fromEntries(entries)` / `fromMap(map)` / `fromSet(set)`** _(static)_: Build from common JS structures.
- **`Collection.times(n, callback)`** _(static)_: Builds a Collection by invoking the callback `n` times (1-indexed).
- **`Collection.range(start, end, step?)`** _(static)_: A sequence of numbers.
- **`Collection.empty()`** _(static)_: An empty collection.
- **`wrap(value)` / `unwrap(value)`** _(static)_: Wrap a value into / unwrap a value out of a collection.
- **`lazy()`**: Convert to a [LazyCollection](/guide/lazy-collections).

## Extraction & Conversion

- **`all()`**: Returns the underlying array (by reference).
- **`toArray()`**: Returns a shallow copy of the underlying array.
- **`toJson()` / `toPrettyJson(indent?)`**: Serialize to JSON.
- **`toMap(keyFn, valueFn)` / `toSet()`**: Convert to a `Map` / `Set`.
- **`clone()`**: Deep-clone the collection's data.
- **`implode(glueOrFormatter, keyOrSeparator?)`**: Joins the items into a string.
- **`join(glue, finalGlue?)`**: Joins with an optional distinct glue for the last item ("and").

## Filtering

- **`filter(callback?)`**: Keeps items passing the test; with no callback, drops falsy values.
- **`reject(callback)`**: The inverse of `filter`.
- **`where(key, operator?, value?)`**: Filters by key/value, with optional operator (`where('price', '>', 100)`). Supports dot-notation paths.
- **`whereStrict(key, value)`**: Filters using strict (`===`) comparison.
- **`whereBetween(key, [min, max])` / `whereNotBetween(key, [min, max])`**: Range filters.
- **`whereIn(key, values)` / `whereNotIn(key, values)`** (+ `…Strict`): Membership filters.
- **`whereNull(key)` / `whereNotNull(key)`**: Null filters.
- **`whereLike(key, pattern, caseSensitive?)` / `whereNotLike(...)`**: SQL-`LIKE` pattern filter (`%` = any run, `_` = single char).
- **`whereInstanceOf(Class)`**: Keeps instances of a class.
- **`compact()`**: Removes `null`/`undefined` and narrows the type to `NonNullable<T>`.
- **`unique(by?)` / `uniqueStrict(by?)`**: Unique items.
- **`only(keys)` / `except(keys)`**: Keep/drop the given keys on each object element (returns `Collection<Partial<T>>`).
- **`select(keys)`**: SQL-`SELECT`-style projection of keys on each element.
- **`first(callback?)` / `firstOrFail(callback?)`**: First match (or throw). _No default-value argument._
- **`firstWhere(key, operator?, value?)`**: First element matching a key/value pair.
- **`last(callback?)`**: Last match. _No default-value argument._
- **`sole(callback?)`**: The single matching element, or throws if 0 or >1 match.

## Mapping & Transformation

- **`map(callback)`** · **`mapInto(Class)`** · **`mapSpread(callback)`** · **`flatMap(callback)`**
- **`mapWithKeys(callback)` / `mapToGroups(callback)`**: _Terminal_ — return a plain object.
- **`flatten(depth?)`** · **`collapse()`** · **`collapseWithKeys()`**
- **`chunk(size)`** · **`chunkWhile(callback)`** · **`sliding(size, step?)`** · **`split(n)`** · **`splitIn(n)`**
- **`dot()`**: _Terminal_ — flattens to a dot-keyed object. **`undot()`**: expands a dot-keyed object back into a nested one (returns a collection).
- **`flip()`**: Swaps values→indices for an array of scalars (returns a collection wrapping the resulting object).
- **`pluck(value)`**: returns a `Collection`. **`pluck(value, key)`**: _terminal_ — returns a keyed object.
- **`values()` / `keys()`** · **`zip(items)`** · **`combine(values)`** (_terminal_) · **`crossJoin(...arrays)`**

## Math & Aggregation

- **`sum(by?)`** · **`average(by?)` / `avg(by?)`** · **`count()`** · **`percentage(callback, precision?)`**
- **`min(by?)` / `max(by?)`**: Min/max by natural order — works on numbers, strings, and `Date`s. Use **`minBy<R>(by?)` / `maxBy<R>(by?)`** for fully-typed non-numeric results.
- **`median(by?)`** · **`mode(by?)`**
- **`countBy(by?)`**: _Terminal_ — returns a `Record<string, number>`.

## Statistics

`variance` · `sampleVariance` · `stddev` · `sampleStddev` · `quantile(q, by?)` · `percentileAt(p, by?)` · `histogram(bins, options?)` · `correlation(xBy, yBy)`. See [Beyond Laravel](/guide/beyond-laravel#statistics).

## Joins

`joinOn` (inner) · `leftJoin` · `rightJoin` · `outerJoin`. See [Beyond Laravel](/guide/beyond-laravel#sql-style-joins).

## Itertools & Combinatorics

`scan` · `pairwise` · `enumerate` · `cycle` · `interleave` · `permutations` · `combinations` · `powerSet`. See [Beyond Laravel](/guide/beyond-laravel#itertools-combinatorics).

## Sorting

- **`sort(comparator?)`** · **`sortDesc()`**
- **`sortBy(spec)` / `sortByDesc(spec)`**: Sort by key, dot-path, callback, `[key, direction]` tuples, or an array thereof.
- **`sortKeys()` / `sortKeysDesc()` / `sortKeysUsing(comparator)`**: Sort each object element's keys.
- **`reverse()`** · **`shuffle(random?)`**

## Searching & Inspection

- **`contains(...)` / `containsStrict(...)`** · **`doesntContain(...)` / `doesntContainStrict(...)`**
- **`containsOneItem()`**: True when the collection has exactly one item.
- **`search(value | callback, strict?)`**: Returns the index, or `false` if not found.
- **`has(keys)` / `hasAny(keys)`**: Whether object elements contain the given key(s).
- **`hasSole(predicate?)`**: Exactly one item (matching the predicate). **`hasMany(predicate?)`**: More than one.
- **`after(value | callback, strict?)` / `before(...)`**: Adjacent item, or `undefined`.
- **`every(callback)` / `some(callback)`** · **`isEmpty()` / `isNotEmpty()`** · **`count()`**

## Iteration

- **`each(callback)`** (return `false` to break) · **`eachSpread(callback)`** · **`tapEach(callback)`**
- **`tap(callback)`** · **`transform(callback)`** (_in-place_) · **`pipe(callback)`** · **`pipeInto(Class)`** · **`pipeThrough(callbacks)`**

## Partitioning & Access

- **`partition(callback)`**: `[passed, failed]`.
- **`groupBy(by)` / `keyBy(by)`**: _Terminal_ — return plain objects. **`groupByMany(groupers)`**: nested grouping.
- **`take(n)` / `takeUntil(...)` / `takeWhile(...)`** · **`skip(n)` / `skipUntil(...)` / `skipWhile(...)`**
- **`slice(offset, length?)`** · **`forPage(page, perPage)`** · **`nth(step, offset?)`**
- **`get(index, default?)`**: Item at a numeric index. **`value(key)`**: a key's value from the first element.

## Addition & Removal

- **`push(...values)`** _(in-place)_ · **`prepend(value)`** _(in-place)_ · **`concat(items)`**
- **`merge(...sources)`**: Sources are arrays/collections. Two single-object collections merge by key; otherwise items are appended.
- **`mergeRecursive(...sources)`** · **`union(items)`**
- **`diff(items)` / `diffAssoc(items)` / `diffAssocUsing(items, cmp)` / `diffKeys(keys)`**
- **`intersect(items)` / `intersectUsing(items, cmp)` / `intersectAssoc(items)` / `intersectAssocUsing(other, cmp)` / `intersectByKeys(keys)`**
- **`pop(count?)`** _(in-place)_ · **`shift(count?)`** _(in-place)_ · **`pull(value)`** _(in-place, by value)_
- **`forget(keys)`** _(in-place)_ · **`splice(offset, length?, ...replacement)`** _(in-place)_
- **`put(key, value)`**: Sets a key on each object element. · **`replace(map)` / `replaceRecursive(patches)`** (index-keyed).
- **`pad(size, value)`** · **`multiply(factor)`** (alias `repeat`) · **`random(count?)`**

## Conditional Operations

- **`when(condition, callback, fallback?)` / `unless(condition, callback, fallback?)`**
- **`whenEmpty(callback, fallback?)` / `whenNotEmpty(callback, fallback?)`**
- **`unlessEmpty(callback)` / `unlessNotEmpty(callback)`**

## Type Safety & Debugging

- **`ensure(...types)`**: Asserts every element matches a type. Use primitive **strings** (`'number'`, `'string'`, …) for primitives and **constructors** for class instances; throws `UnexpectedValueException` otherwise.
- **`dump()`**: Logs the items and continues. **`dd()`**: Logs and halts (throws).

_For the extended async and I/O surface, see [Beyond Laravel](/guide/beyond-laravel)._
