# Methods (S)

## `search`

Searches the collection for the given value and returns its key (or index) if found. Returns `false` or `undefined` if the item is not found.

**Simple Example:**

```typescript
const items = collect([2, 4, 6, 8])

items.search(4) // => 1

items.search(10) // => false
```

**Complex Example (Strict match):**
The search method offers a `strict` flag as its second parameter.

```typescript
const items = collect([2, 4, 6, 8])

items.search('4') // => 1 (loose matching)
items.search('4', true) // => false (strict matching requires number)
```

---

## `select`

Selects only the specified keys from the collection items. Works similarly to `only`, but applies to each item in an array of dictionaries.

**Complex Example:**

```typescript
const users = collect([
  { id: 1, name: 'John', role: 'Admin' },
  { id: 2, name: 'Jane', role: 'Guest' }
])

users.select(['name']).all()
// => [{ name: 'John' }, { name: 'Jane' }]
```

---

## `shift`

Removes and returns the first item from the collection.

**Simple Example:**

```typescript
const items = collect([1, 2, 3])

const first = items.shift() // => 1

items.all() // => [2, 3]
```

---

## `shuffle`

Randomly shuffles the items in the collection.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5])

items.shuffle().all()
// => [3, 1, 5, 2, 4]
```

---

## `skip`

Skips the specified number of items and returns a new collection containing the rest.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5, 6, 7])

items.skip(4).all()
// => [5, 6, 7]
```

---

## `skipUntil`

Skips items from the collection until the given callback returns true. Any subsequent items will be returned.

**Complex Example:**

```typescript
const items = collect([1, 2, 3, 4, 5])

items.skipUntil((item) => item >= 3).all()
// => [3, 4, 5]
```

---

## `skipWhile`

Skips items from the collection while the given callback returns true. Any subsequent items will be returned.

**Complex Example:**

```typescript
const items = collect([1, 2, 3, 4, 5])

items.skipWhile((item) => item < 3).all()
// => [3, 4, 5]
```

---

## `slice`

Returns a slice of the collection starting at the given index.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

// Slice from index 4 onwards
items.slice(4).all()
// => [5, 6, 7, 8, 9, 10]

// Slice from index 4 length 2
items.slice(4, 2).all()
// => [5, 6]
```

---

## `sliding`

Returns a new collection of chunks representing a "sliding window" view of the items in the collection.

**Complex Example:**

```typescript
const collection = collect([1, 2, 3, 4, 5])

const chunks = collection.sliding(2)

chunks.all()
// => [[1, 2], [2, 3], [3, 4], [4, 5]]
```

---

## `sole`

Returns the only element in the collection that passes a given truth test. If zero, or more than one element pass the test it throws an `ItemNotFoundException` or `MultipleItemsFoundException`.

**Simple Example:**

```typescript
const users = collect([
  { name: 'Alice', admin: true },
  { name: 'Bob', admin: false }
])

users.sole('admin', true)
// => { name: 'Alice', admin: true }
```

---

## `some`

Identical to `contains(callback)`. Determines whether the collection contains an item passing the given test.

**Simple Example:**

```typescript
collect([1, 2, 3, 4]).some((i) => i % 2 === 0)
// => true
```

---

## `sort`

Sorts the collection's items with standard JavaScript arrays mechanics or via a custom provided callback.

**Simple Example:**

```typescript
const items = collect([5, 3, 1, 2, 4])

items.sort().all()
// => [1, 2, 3, 4, 5]
```

---

## `sortBy`

Sorts the collection by the given key.

**Simple Example:**

```typescript
const users = collect([
  { name: 'Alice', age: 30 },
  { name: 'Bob', age: 25 },
  { name: 'Charlie', age: 35 }
])

users.sortBy('age').all()
/*
[
    { name: 'Bob', age: 25 },
    { name: 'Alice', age: 30 },
    { name: 'Charlie', age: 35 }
]
*/
```

---

## `sortByDesc` / `sortDesc`

Sorts the collection by the given key, but in descending (reversed) order. `sortDesc` applies to flat arrays.

**Simple Example:**

```typescript
const items = collect([5, 3, 1, 2, 4])

items.sortDesc().all()
// => [5, 4, 3, 2, 1]
```

---

## `sortKeys` / `sortKeysDesc`

Sorts the collection dictionary by its underlying keys.

**Simple Example:**

```typescript
const object = collect({ z: 1, c: 2, a: 3 })

object.sortKeys().all()
// => { a: 3, c: 2, z: 1 }

object.sortKeysDesc().all()
// => { z: 1, c: 2, a: 3 }
```

---

## `sortKeysUsing`

Sorts the object's keys using the given callback logic.

**Complex Example:**

```typescript
const object = collect({ b: 2, a: 1, c: 3 })

// Use custom reverse order calculation
object.sortKeysUsing((key1, key2) => key2.localeCompare(key1)).all()
// => { c: 3, b: 2, a: 1 }
```

---

## `splice`

Removes and returns a slice of items starting at the specified index. This **preserves** the original Array/Collection untouched.

**Simple Example:**

```typescript
const collection = collect([1, 2, 3, 4, 5])

const chunk = collection.splice(2)

chunk.all()
// => [3, 4, 5]
```

---

## `split`

Splits a collection into the given number of groups. The chunks are split dynamically to have as close to identical lengths as possible.

**Simple Example:**

```typescript
const collection = collect([1, 2, 3, 4, 5])

const groups = collection.split(3)

groups.all()
// => [[1, 2], [3, 4], [5]]
```

---

## `splitIn`

Splits the collection in _exactly_ the number of groups defined. The chunks might be uneven depending on the number.

**Complex Example:**

```typescript
const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])

const groups = collection.splitIn(3)

groups.all()
// => [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
```

---

## `sum`

Returns the full numerical mathematical sum of all items in the collection.

**Simple Example:**

```typescript
collect([1, 2, 3, 4, 5]).sum()
// => 15
```

**Complex Example (Keys and Calbacks):**

```typescript
const expenses = collect([
  { dev: 'AWS', cost: 100 },
  { dev: 'Github', cost: 50 }
])

// Pass a key to sum across objects
expenses.sum('cost')
// => 150

// Pass a complex callback to calculate dynamic nested sums
expenses.sum((e) => e.cost * 1.2 /* Add 20% VAT */)
// => 180
```
