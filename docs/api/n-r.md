# Methods (N - R)

## `nth`

Creates a new collection consisting of every n-th element from the original collection.

**Simple Example:**

```typescript
const items = collect(['a', 'b', 'c', 'd', 'e', 'f'])

items.nth(4).all()
// => ['a', 'e']
```

**Complex Example (Offsets):**
You may optionally pass an offset as the second argument.

```typescript
const items = collect(['a', 'b', 'c', 'd', 'e', 'f'])

// Grab every 2nd element, starting from index 1 (the 'b')
items.nth(2, 1).all()
// => ['b', 'd', 'f']
```

---

## `only`

Keeps only the specified keys on each object element, returning a `Collection<Partial<T>>`.

**Simple Example:**

```typescript
const user = collect([{ id: 1, name: 'Anil', role: 'Admin', email: 'anil@example.com' }])

user.only(['id', 'email']).all()
// => [{ id: 1, email: 'anil@example.com' }]
```

---

## `pad`

Pads the collection with the given value up to the specified length. If the size is less than or equal to the current collection length, no padding takes place.

**Simple Example:**

```typescript
collect([1, 2, 3]).pad(5, 0).all()
// => [1, 2, 3, 0, 0]

// Padding on the left using a negative size
collect([1, 2, 3]).pad(-5, 0).all()
// => [0, 0, 1, 2, 3]
```

---

## `partition`

Separates the elements that pass a given truth test from those that fail it. Returns an array with two nested Collections.

**Complex Example:**

```typescript
const users = collect([
  { name: 'Alice', active: true },
  { name: 'Bob', active: false },
  { name: 'Charlie', active: true }
])

const [active, inactive] = users.partition((user) => user.active)

active.all() // => [{ name: 'Alice', active: true }, { name: 'Charlie', active: true }]
inactive.all() // => [{ name: 'Bob', active: false }]
```

---

## `percentage`

Calculates and returns the percentage of items in the collection that pass a given truth test.

**Simple Example:**

```typescript
const items = collect([1, 1, 1, 2, 2])

// What percentage of items are equal to 1?
items.percentage((x) => x === 1)
// => 60
```

---

## `pipe`

Passes the collection to the given callback and **returns the result** of the callback. This breaks the chain and does not return the same Collection instance (unless returned by the callback).

**Complex Example:**

```typescript
const collection = collect([1, 2, 3])

const result = collection.pipe((c) => {
  return c.sum() + 10
})

result
// => 16
```

---

## `pipeInto`

Instead of passing the collection closure to a callback, this passes the Collection directly into a new instantiation of the given Class. It conceptually creates a new `YourClass(collection)`.

**Complex Example:**

```typescript
class ProductCatalog {
  private items
  constructor(collection) {
    this.items = collection
  }
  count() {
    return this.items.count()
  }
}

const count = collect(['Shoe', 'Shirt']).pipeInto(ProductCatalog).count()
// => 2
```

---

## `pipeThrough`

Passes the collection through a cascading sequence of callbacks, piping the output of the first callback into the second, and so on.

**Complex Example:**

```typescript
const collection = collect([1, 2, 3])

const result = collection.pipeThrough([
  (c) => c.sum(),
  (sum) => sum + 10,
  (total: number) => `Total: $${Math.round(total)}`
])

result
// => 'Total: $16'
```

---

## `pluck`

Retrieves all of the values for a given key. Highly useful for transforming object arrays.

**Simple Example:**

```typescript
const apps = collect([
  { os: 'mac', title: 'Arc' },
  { os: 'windows', title: 'Edge' }
])

apps.pluck('title').all()
// => ['Arc', 'Edge']
```

**Complex Example (Keyed result):**
Passing a second argument keys the result by that field. With two arguments `pluck` is **terminal** — it returns a plain object directly (no `.all()`).

```typescript
apps.pluck('title', 'os')
// => { mac: 'Arc', windows: 'Edge' }
```

---

## `pop`

Removes and returns the last item from the collection.

**Simple Example:**

```typescript
const items = collect([1, 2, 3])

const popped = items.pop() // => 3

items.all() // => [1, 2]
```

---

## `prepend`

Adds an item to the beginning of the collection, **in place**.

**Simple Example:**

```typescript
const items = collect([1, 2, 3])

items.prepend(0).all()
// => [0, 1, 2, 3]
```

---

## `pull`

Removes and returns the first item **equal to the given value**, mutating the collection in place. Returns `undefined` if no item matches.

**Simple Example:**

```typescript
const items = collect(['a', 'b', 'c'])

const removed = items.pull('b') // => 'b'

items.all()
// => ['a', 'c']
```

---

## `push`

Appends an item to the end of the collection.

**Simple Example:**

```typescript
const items = collect([1, 2, 3])

items.push(4).all()
// => [1, 2, 3, 4]
```

---

## `put`

Sets the given key/value on **every object element**, returning a new collection.

**Simple Example:**

```typescript
const items = collect([{ a: 1 }])

items.put('b', 2).all()
// => [{ a: 1, b: 2 }]
```

---

## `random`

Returns a random element from the collection. Optionally, you may pass an integer to request multiple random items.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5])

items.random()
// => 4

items.random(3).all()
// => [1, 5, 2]
```

---

## `range`

Static helper to generate collections holding a sequence of consecutive integers.

**Simple Example:**

```typescript
import { Collection } from '@anil-labs/collection-js'

Collection.range(1, 5).all()
// => [1, 2, 3, 4, 5]
```

---

## `reduce`

Collapses the collection down into a single value. Operates identical to standard JavaScript `reduce`.

**Complex Example:**

```typescript
const items = collect([
  { name: 'Laptop', price: 1000 },
  { name: 'Mouse', price: 50 }
])

const total = items.reduce((carry, item) => carry + item.price, 0)

total
// => 1050
```

---

## `reduceSpread`

Works like `reduce`, but is tailored to handle arrays of arrays, spreading each nested item into the callback scope.

**Complex Example:**

```typescript
const coordinates = collect([
  [10, 10], // first x, y
  [20, 20] // second x, y
])

// carry is still the first variable
const mapped = coordinates.reduceSpread((carry, x, y) => {
  return carry + x + y
}, 0)

mapped
// => 60
```

---

## `reject`

The inverse of `filter`. It removes any elements that return `true` from the truth test callback.

**Simple Example:**

```typescript
const users = collect(['Alice', 'Bob', 'Admin', 'Guest'])

const safe = users.reject((user) => user === 'Admin')

safe.all()
// => ['Alice', 'Bob', 'Guest']
```

---

## `replace`

Replaces elements at the given **numeric indices** with new values, returning a new collection. The argument is an index→value map.

**Simple Example:**

```typescript
const first = collect(['Taylor', 'Abigail', 'Otis'])

// Replace the element at index 2
first.replace({ 2: 'Victoria' }).all()
// => ['Taylor', 'Abigail', 'Victoria']
```

---

## `replaceRecursive`

Works like `replace`, but recurses deeply into nested objects/arrays. The patch argument is an **array** applied element-wise.

**Complex Example:**

```typescript
const items = collect([
  {
    os: 'Mac',
    specs: { ram: '16gb', cpu: 'm1' }
  }
])

items.replaceRecursive([{ specs: { ram: '32gb' } }]).all()
// => [{ os: 'Mac', specs: { ram: '32gb', cpu: 'm1' } }]
```

---

## `reverse`

Reverses the order of the collection's items in place (creates a new instance).

**Simple Example:**

```typescript
const items = collect(['a', 'b', 'c'])

items.reverse().all()
// => ['c', 'b', 'a']
```
