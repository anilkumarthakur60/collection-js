# Methods (G - M)

## `get`

Returns the item at a given key. If the key does not exist, `null` is returned (or an optional default value).

**Simple Example:**

```typescript
const items = collect({ name: 'Anil', age: 25 })

items.get('name')
// => 'Anil'

items.get('country', 'Unknown')
// => 'Unknown'
```

---

## `groupBy`

Groups the collection's items by a given key or callback.

**Simple Key Example:**

```typescript
const users = collect([
  { id: 1, account_id: 'A' },
  { id: 2, account_id: 'B' },
  { id: 3, account_id: 'A' }
])

const groups = users.groupBy('account_id')

groups.all()
/*
{
    'A': [{ id: 1 }, { id: 3 }],
    'B': [{ id: 2 }]
}
*/
```

**Complex Callback Example:**

```typescript
const numbers = collect([1, 2, 3, 4, 5, 6])

const parity = numbers.groupBy((num) => (num % 2 === 0 ? 'even' : 'odd'))

parity.all()
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
const items = collect({ a: 1, b: 2, c: 3 })

items.has('b') // => true
items.has(['a', 'd']) // => false (requires ALL keys)
```

---

## `hasAny`

Determines whether any of the given keys exist in the collection.

**Simple Example:**

```typescript
const items = collect({ a: 1, b: 2 })

items.hasAny(['b', 'c']) // => true
```

---

## `hasMany` / `hasSole`

These methods verify whether multiple keys, or exactly one solitary key, are present in the collection/object.

```typescript
const items = collect({ role: 'admin' })

items.hasSole(['role', 'salary']) // => true (only role exists)
items.hasMany(['role', 'salary']) // => false
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

Comparisons that respect object keys and values (Assoc) or strictly keys (ByKeys).

```typescript
const user = collect({ id: 1, theme: 'dark' })

// Keeps key/value pairs that identically exist in both
user.intersectAssoc({ theme: 'dark', verified: true }).all()
// => { theme: 'dark' }
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

```typescript
const items = collect([
  { id: 'usr_1', email: 'alice@' },
  { id: 'usr_2', email: 'bob@' }
])

items.keyBy('id').all()
/*
{
    usr_1: { id: 'usr_1', email: 'alice@' },
    usr_2: { id: 'usr_2', email: 'bob@' }
}
*/
```

---

## `keys`

Returns all of the collection's dictionary keys.

**Simple Example:**

```typescript
collect({ name: 'Anil', os: 'Mac' }).keys().all()
// => ['name', 'os']
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
import { Collection } from '@anilkumarthakur/collection'

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

Loops over the collection and expects you to return a single key/value array or tuple. It then constructs a dictionary object out of those return values.

**Complex Example:**

```typescript
const items = collect([
  { name: 'John', dev: 'React' },
  { name: 'Jane', dev: 'Vue' }
])

const dictionary = items.mapWithKeys((item) => {
  return [item.name, item.dev]
})

dictionary.all()
// => { 'John': 'React', 'Jane': 'Vue' }
```

---

## `max` / `min`

Returns the maximum or minimum value in the collection.

**Simple Example:**

```typescript
collect([10, 20, 30]).max() // => 30
collect([10, 20, 30]).min() // => 10

// Plucking nested details
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

Merges the given array or collection into the original collection. Overlapping string keys are overwritten.

**Simple Example:**

```typescript
collect(['a', 'b']).merge(['c', 'd']).all()
// => ['a', 'b', 'c', 'd']

collect({ a: 1 }).merge({ b: 2, a: 5 }).all()
// => { a: 5, b: 2 }
```

---

## `mergeRecursive`

Merges dictionaries recursively. Instead of overwriting string keys, it will convert overlapping keys into depth-nested arrays.

**Complex Example:**

```typescript
const one = collect({ titles: ['Manager'] })
const merged = one.mergeRecursive({ titles: ['Developer'] })

merged.all()
// => { titles: ['Manager', 'Developer'] }
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
