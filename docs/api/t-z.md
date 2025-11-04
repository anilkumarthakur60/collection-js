# Methods (T - Z)

## `take`

Returns a new collection with the specified number of items.

**Simple Example:**

```typescript
const items = collect([0, 1, 2, 3, 4, 5])

items.take(3).all()
// => [0, 1, 2]
```

**Complex Example (Negative Indexing):**
You may also pass a negative integer to take the specified amount of items from the end of the collection.

```typescript
items.take(-2).all()
// => [4, 5]
```

---

## `takeUntil`

Takes items from the collection until the given callback returns true. Any subsequent items will be ignored.

**Complex Example:**

```typescript
const items = collect([1, 2, 3, 4])

items.takeUntil((item) => item >= 3).all()
// => [1, 2]
```

---

## `takeWhile`

Takes items from the collection while the given callback returns true.

**Complex Example:**

```typescript
const items = collect([1, 2, 3, 4])

items.takeWhile((item) => item < 3).all()
// => [1, 2]
```

---

## `tap`

Passes the collection to the given callback, allowing you to "tap" into the collection at a specific point without mutating it. Excellent for localized debugging or side-effects.

**Complex Example:**

```typescript
collect([2, 4, 3, 1, 5])
  .sort()
  .tap((collection) => {
    console.log('Post sort state:', collection.all())
  })
  .shift()
```

---

## `times`

Creates a Collection by invoking the callback a given amount of times.

**Simple Example:**

```typescript
import { Collection } from '@anilkumarthakur/collection'

Collection.times(5, (i) => i * 10).all()
// => [10, 20, 30, 40, 50]
```

---

## `toArray`

Converts the collection into a plain JavaScript array. If the collection's values are objects traversing a `toArray` method, those will also be recursively evaluated.

**Simple Example:**

```typescript
collect([1, 2, 3]).toArray()
// => [1, 2, 3]
```

---

## `toJson`

Returns the structural, serialized JSON equivalent string representing the items in the collection.

**Simple Example:**

```typescript
collect({ name: 'anil' }).toJson()
// => '{"name":"anil"}'
```

---

## `toPrettyJson`

Returns pretty-printed, indented JSON using `JSON.stringify` whitespace styling.

**Simple Example:**

```typescript
collect({ a: 1, b: 2 }).toPrettyJson()
/*
{
    "a": 1,
    "b": 2
}
*/
```

---

## `transform`

**Warning:** Mutates the underlying collection. Interates over the sequence and calls the given callback, mutating the value matching the key/index inline.

**Simple Example:**

```typescript
const items = collect(['apple'])

items.transform((i) => i.toUpperCase())

items.all() // => ['APPLE']
```

---

## `undot`

Expands a single-dimensional array that uses "dot" notation into a multi-dimensional associative dictionary.

**Complex Example:**

```typescript
const items = collect({
  'user.name': 'Anil',
  'user.framework': 'Laravel'
})

items.undot().all()
// => { user: { name: 'Anil', framework: 'Laravel' } }
```

---

## `union`

Adds the given array to the collection. If the overlapping keys match, the _original_ collection's values override.

**Simple Example:**

```typescript
const original = collect({ a: 'X' })

original.union({ a: 'Y', b: 'Z' }).all()
// => { a: 'X', b: 'Z' }
```

---

## `unique`

Returns all unique elements without duplicates in a generic fashion.

**Simple Example:**

```typescript
collect([1, 1, 2, 2]).unique().all()
// => [1, 2]
```

---

## `uniqueStrict`

Returns all unique items based strictly on type/memory signatures.

**Simple Example:**

```typescript
collect([1, '1']).uniqueStrict().all()
// => [1, '1']
```

---

## `unless` / `unlessEmpty` / `unlessNotEmpty`

Conditional logic methods. Executes the generic callback only if the condition or boolean validates inversely.

```typescript
collect([])
  .unless(false, (collection) => collection.push(1))
  .all()
// => [1]
```

---

## `unwrap`

Safely retrieves the raw data out of a potential or established collection reference.

**Simple Example:**

```typescript
import { Collection } from '@anilkumarthakur/collection'

Collection.unwrap(collect(['a'])) // => ['a']
Collection.unwrap(['a']) // => ['a']
```

---

## `value`

Returns the only, single first item from a given evaluation and stops fetching.

**Simple Example:**

```typescript
collect([{ id: 1 }]).value('id') // => 1
```

---

## `values`

Returns a new collection with the keys reset to consecutive integers. Useful after operations that distort array index associations (like sorting).

**Simple Example:**

```typescript
const filtered = collect([10, 20, 30]).forget(1) // Removes '20'

filtered.values().all()
// => [10, 30] // (0: 10, 1: 30)
```

---

## `when` / `whenEmpty` / `whenNotEmpty`

Executes logical pipeline modifications **only** when standard tests pass true.

**Simple Example:**

```typescript
const hasFilter = true

collect([1, 2, 3])
  .when(hasFilter, (c) => c.filter((i) => i > 1))
  .all()

// => [2, 3]
```

---

## Filtering: Where Directives

Almost identical to standard SQL evaluations, collections support numerous `where` checks on object schemas.

### `where`

```typescript
collect([{ role: 'admin' }, { role: 'user' }]).where('role', 'admin')
```

### `whereBetween` / `whereNotBetween`

```typescript
collect([{ id: 1 }, { id: 5 }, { id: 10 }]).whereBetween('id', [1, 6])
```

### `whereIn` / `whereNotIn`

```typescript
collect([{ age: 10 }, { age: 20 }]).whereIn('age', [20, 30])
```

### `whereNull` / `whereNotNull`

```typescript
collect([{ name: 'Anil' }, { name: null }]).whereNull('name')
```

### `whereInstanceOf`

Filters instances mapped locally by specific TypeScript/ES6 classes.

```typescript
collect([new User(), new Guest()]).whereInstanceOf(User)
```

---

## `wrap`

Forces any raw data schema into a formal `Collection` wrapper. If already a wrapper, returns instantly.

**Simple Example:**

```typescript
Collection.wrap('a').all()
// => ['a']
```

---

## `zip`

Merges the values of another array directly onto the matching index of the collection, resulting in tuple schemas.

**Complex Example:**

```typescript
const types = collect(['Chair', 'Desk'])

const zipped = types.zip([100, 200])

zipped.all()
// => [['Chair', 100], ['Desk', 200]]
```
