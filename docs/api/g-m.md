# Methods (G - M)

## `get`

Returns the item at a given **numeric index** (negative indices count from the end). If the index is out of range, `undefined` is returned, or an optional default value (which may be a factory function).

**Simple Example:**

```typescript
const items = collect(['a', 'b', 'c'])

items.get(1) // => 'b'
items.get(-1) // => 'c'
items.get(10, 'fallback') // => 'fallback'
```

::: tip Looking up an object key?
`get` is index-based. To read a property from an element, use plain access or the `value(key)` helper:

```typescript
collect([{ name: 'Anil' }]).value('name') // => 'Anil'
```

:::

---

## `groupBy`

Groups the collection's items by a given key or callback.

**Simple Key Example:**

````typescript
const users = collect([
  { id: 1, account_id: 'A' },
  { id: 2, account_id: 'B' },
  { id: 3, account_id: 'A' }
])

This is a **terminal** method — it returns a plain object (not a chainable collection).

```typescript
users.groupBy('account_id')
/*
{
    'A': [{ id: 1, account_id: 'A' }, { id: 3, account_id: 'A' }],
    'B': [{ id: 2, account_id: 'B' }]
}
*/
````

**Complex Callback Example:**

```typescript
const numbers = collect([1, 2, 3, 4, 5, 6])

numbers.groupBy((num) => (num % 2 === 0 ? 'even' : 'odd'))
/*
{
    odd: [1, 3, 5],
    even: [2, 4, 6]
}
*/
```

---

## `has`

Determines if a given key exists in the collection.

**Simple Example:**

```typescript
const items = collect([{ a: 1, b: 2, c: 3 }])

items.has('b') // => true
items.has(['a', 'd']) // => false (requires ALL keys)
```

---

## `hasAny`

Determines whether any of the given keys exist in the collection.

**Simple Example:**

```typescript
const items = collect([{ a: 1, b: 2 }])

items.hasAny(['b', 'c']) // => true
```

---

## `hasMany` / `hasSole`

`hasSole` returns `true` when the collection contains exactly one item; `hasMany` returns `true` when it contains more than one. Both accept an optional predicate, in which case they count only the matching items.

```typescript
collect([1]).hasSole() // => true
collect([1, 2]).hasSole() // => false
collect([1, 2, 3]).hasMany() // => true

// With a predicate (count matching items):
collect([{ age: 2 }, { age: 3 }]).hasSole((u) => u.age === 2) // => true
collect([{ age: 2 }, { age: 2 }]).hasMany((u) => u.age === 2) // => true
```

---

## `implode`

Joins the items in a collection. Its arguments depend on the type of items in the collection.

**Simple Example (Flat Arrays):**

```typescript
collect([1, 2, 3, 4]).implode('-')
// => '1-2-3-4'
```

**Complex Example (Dictionaries):**
If the collection contains objects, pass the key you wish to join.

```typescript
const items = collect([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' }
])

items.implode('name', ', ')
// => 'John, Jane'
```

---

## `intersect`

Removes any values from the original collection that are not present in the given array or collection. Returns values that overlap.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4])
const intersection = items.intersect([2, 4, 6])

intersection.all()
// => [2, 4]
```

---

## `intersectAssoc` / `intersectByKeys`

Per object element, keeps only the key/value pairs that also appear in the comparison object (`intersectAssoc`), or only the listed keys (`intersectByKeys`). The comparison argument is an **array** of objects (or a single-element one to represent a dictionary).

```typescript
const user = collect([{ id: 1, theme: 'dark' }])

// Keep key/value pairs present in both
user.intersectAssoc([{ theme: 'dark', verified: true }]).all()
// => [{ theme: 'dark' }]

// Keep only the listed keys
user.intersectByKeys(['theme']).all()
// => [{ theme: 'dark' }]
```

---

## `isEmpty` / `isNotEmpty`

Returns true if the collection is empty, and false if it contains items.

**Simple Example:**

```typescript
collect([]).isEmpty() // => true
collect([1]).isNotEmpty() // => true
```

---

## `join`

Joins the collection's items with a string. Optionally accepts a distinct glue string for the final item (e.g. "and").

**Complex Example:**

```typescript
collect(['a', 'b', 'c']).join(', ')
// => 'a, b, c'

collect(['a', 'b', 'c']).join(', ', ', and ')
// => 'a, b, and c'
```

---

## `keyBy`

Keys the collection by the given key. If multiple items have the same key, only the last one will appear in the new collection.

**Simple Example:**

````typescript
This is a **terminal** method — it returns a plain object (not a chainable collection).

```typescript
const items = collect([
  { id: 'usr_1', email: 'alice@' },
  { id: 'usr_2', email: 'bob@' }
])

items.keyBy('id')
/*
{
    usr_1: { id: 'usr_1', email: 'alice@' },
    usr_2: { id: 'usr_2', email: 'bob@' }
}
*/
````

---

## `keys`

Returns the keys of the collection. For a list of objects it returns the union of the elements' property names; otherwise it returns the numeric indices as strings.

**Simple Example:**

```typescript
collect([{ name: 'Anil', os: 'Mac' }])
  .keys()
  .all()
// => ['name', 'os']

collect(['a', 'b', 'c']).keys().all()
// => ['0', '1', '2']
```

---

## `last`

Returns the last element in the collection that passes a given truth test (or just the final item if no truth test is provided).

**Simple Example:**

```typescript
collect([1, 2, 3]).last()
// => 3

collect([1, 2, 3, 4, 5]).last((i) => i < 4)
// => 3
```

---

## `lazy`

Converts a standard Collection into a `LazyCollection`. Lazy Collections utilize JavaScript Generators to parse infinite data with minimal memory constraints.

**Simple Example:**

```typescript
collect([1, 2, 3])
  .lazy()
  .map((i) => i * 2)
  .all()
```

---

## `macro`

Static method used to extend the `Collection` class with custom functions at runtime.

**Complex Example:**

```typescript
import { Collection } from '@anilkumarthakur/collection-js'

Collection.macro('sumAndDouble', function () {
  return this.sum() * 2
})

collect([1, 2, 3]).sumAndDouble()
// => 12
```

---

## `map`

Iterates through the collection and passes each value to the given callback, replacing the value with the return of the callback.

**Simple Example:**

```typescript
collect([1, 2, 3])
  .map((i) => i * 10)
  .all()
// => [10, 20, 30]
```

---

## `mapInto`

Injects each element of the collection into the constructor of a given ES6 class.

**Complex Example:**

```typescript
class Currency {
  value: number
  constructor(v: number) {
    this.value = v
  }
}

const items = collect([10, 20])

const mapped = items.mapInto(Currency)
// Output contains actual instantiated `Currency` objects
```

---

## `mapSpread`

Iterates over a chunked collection, spreading the nested arrays explicitly into the callback arguments.

**Complex Example:**

```typescript
collect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
  .chunk(2)
  .mapSpread((even, odd) => {
    return even + odd
  })
  .all()

// => [1, 5, 9, 13, 17]
```

---

## `mapWithKeys`

Loops over the collection, expecting a `[key, value]` tuple from the callback, and builds an object from those pairs. This is a **terminal** method — it returns a plain object (not a chainable collection).

**Complex Example:**

```typescript
const items = collect([
  { name: 'John', dev: 'React' },
  { name: 'Jane', dev: 'Vue' }
])

items.mapWithKeys((item) => [item.name, item.dev])
// => { 'John': 'React', 'Jane': 'Vue' }
```

---

## `max` / `min`

Returns the maximum or minimum value in the collection by natural order. Works on numbers, strings, and `Date`s; `null`/`undefined` entries are ignored. For fully-typed non-numeric results, use `maxBy<R>` / `minBy<R>`.

**Simple Example:**

```typescript
collect([10, 20, 30]).max() // => 30
collect([10, 20, 30]).min() // => 10

// Strings compare lexicographically
collect(['banana', 'apple', 'cherry']).max() // => 'cherry'

// By key / callback
collect([{ score: 50 }, { score: 99 }]).max('score') // => 99
```

---

## `median` / `mode`

Returns the median (middle) or mode (most frequent) value(s).

**Simple Example:**

```typescript
collect([10, 10, 20, 40]).median() // => 15
collect([10, 10, 20, 40]).mode() // => [10]
```

---

## `merge`

Merges the given **array(s) or collection(s)** into the original. List values are appended. When both the collection and the source each hold a single object, those objects are merged by key (later wins).

**Simple Example:**

```typescript
collect(['a', 'b']).merge(['c', 'd']).all()
// => ['a', 'b', 'c', 'd']

// Two single-object collections merge by key:
collect([{ a: 1 }])
  .merge([{ b: 2, a: 5 }])
  .all()
// => [{ a: 5, b: 2 }]
```

---

## `mergeRecursive`

Recursively merges object elements. Overlapping array values are concatenated; overlapping scalar values are combined into arrays. The source is an **array/collection**.

**Complex Example:**

```typescript
const one = collect([{ titles: ['Manager'] }])

one.mergeRecursive([{ titles: ['Developer'] }]).all()
// => [{ titles: ['Manager', 'Developer'] }]
```

---

## `multiply`

Multiplies the collection items by a given scalar.

**Simple Example:**

```typescript
collect([1, 2, 3]).multiply(3).all()
// => [3, 6, 9]

collect(['A', 'B']).multiply(2).all()
// => ['A', 'B', 'A', 'B']
```
