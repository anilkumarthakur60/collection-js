# Methods (A - C)

## `after`

Returns the item in the collection occurring immediately after the given item. Returns `null` if the item is not found or is the last item.

**Basic Setup:**

```typescript
import collect from '@anilkumarthakur/collection-js'

const items = collect([1, 2, 3, 4, 5])
```

**Simple Example:**

```typescript
items.after(3)
// => 4

items.after(5)
// => null
```

**Complex Example (Custom Truth Test):**
You can also pass a callback to find an item dynamically.

```typescript
const users = collect([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
])

users.after((user) => user.name === 'Bob')
// => { id: 3, name: 'Charlie' }
```

---

## `all`

Returns the underlying array represented by the collection.

**Simple Example:**

```typescript
collect([1, 2, 3]).all()
// => [1, 2, 3]
```

---

## `average` / `avg`

Returns the average value of a given key. Alias for `avg()`.

**Simple Example:**

```typescript
collect([10, 20, 30]).average()
// => 20
```

**Complex Example (Nested Objects):**

```typescript
const orders = collect([
  { id: 1, totals: { price: 100 } },
  { id: 2, totals: { price: 200 } },
  { id: 3, totals: { price: 300 } }
])

// Using dot notation for nested keys
orders.average('totals.price')
// => 200

// Using a custom callback for complex logic
orders.avg((order) => order.totals.price * 1.5) // With 50% tax
// => 300
```

---

## `before`

Returns the item in the collection occurring immediately before the given item. Returns `null` if the item is not found or is the first item.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5])

items.before(3)
// => 2
```

**Complex Example (Custom Truth Test):**

```typescript
const users = collect([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
])

users.before((user) => user.name === 'Charlie')
// => { id: 2, name: 'Bob' }
```

---

## `chunk`

Breaks the collection into multiple, smaller collections of a given size.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5, 6, 7])

const chunks = items.chunk(3)

chunks.all()
/*
[
  [1, 2, 3],
  [4, 5, 6],
  [7]
]
*/
```

---

## `chunkWhile`

Breaks the collection into multiple, smaller collections based on the evaluation of the given callback. The callback passes the current, previous, and index.

**Complex Example (Chunking by sequential groups):**
Imagine grouping chat messages by consecutive sent times.

```typescript
const messages = collect([
  { id: 1, user: 'A' },
  { id: 2, user: 'A' },
  { id: 3, user: 'B' },
  { id: 4, user: 'B' },
  { id: 5, user: 'C' }
])

const chunks = messages.chunkWhile((value, key, chunk) => {
  return value.user === chunk.last().user
})

chunks.all()
/*
[
    [{ id: 1, user: 'A' }, { id: 2, user: 'A' }],
    [{ id: 3, user: 'B' }, { id: 4, user: 'B' }],
    [{ id: 5, user: 'C' }]
]
*/
```

---

## `collapse`

Collapses a collection of arrays into a single, flat collection.

**Simple Example:**

```typescript
const collection = collect([
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9]
])

const collapsed = collection.collapse()

collapsed.all()
// => [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

---

## `collapseWithKeys`

Collapses a collection of objects (dictionaries) into a single, flat object, preserving keys. Note: duplicate keys will be overwritten by the later item.

**Simple Example:**

```typescript
const collection = collect([
  { a: 1, b: 2 },
  { c: 3, d: 4 },
  { b: 5 } // Note: this overwrites the first "b"
])

collection.collapseWithKeys().all()
// => { a: 1, b: 5, c: 3, d: 4 }
```

---

## `collect`

A global helper function that instantiates a new Collection instance.

**Simple Example:**

```typescript
const items = collect([1, 2, 3])
```

---

## `combine`

Combines the values of the collection, as keys, with the values of another array or collection.

**Simple Example:**

```typescript
const keys = collect(['name', 'age'])
const combined = keys.combine(['Alice', 25])

combined.all()
// => { name: 'Alice', age: 25 }
```

---

## `concat`

Appends the given array or collection's values onto the end of the collection.

**Simple Example:**

```typescript
const items = collect(['Alice'])
const merged = items.concat(['Bob', 'Charlie'])

merged.all()
// => ['Alice', 'Bob', 'Charlie']
```

---

## `contains`

Determines whether the collection contains a given item.

**Simple Example:**

```typescript
const items = collect(['name', 'age'])

items.contains('name') // => true
items.contains('weight') // => false
```

**Complex Example (Key / Operator / Value):**
You can use operators or callbacks for complex assertions.

```typescript
const users = collect([
  { id: 1, age: 20 },
  { id: 2, age: 30 }
])

items.contains('age', '>=', 30) // => true

// Custom callback
items.contains((user) => user.age > 25) // => true
```

---

## `containsStrict`

Determines whether the collection contains a given item using strict equality (`===`).

**Simple Example:**

```typescript
const items = collect([1, 2, 3])

items.containsStrict('2') // => false
items.containsStrict(2) // => true
```

---

## `containsOneItem`

Determines whether the collection contains exactly one item.

**Simple Example:**

```typescript
collect([]).containsOneItem() // => false
collect(['single']).containsOneItem() // => true
collect(['many', 'items']).containsOneItem() // => false
```

---

## `count`

Returns the total number of items in the collection.

**Simple Example:**

```typescript
collect([1, 2, 3, 4]).count()
// => 4
```

---

## `countBy`

Counts the occurrences of values in the collection. By default, it counts the items themselves.

**Simple Example:**

```typescript
const collection = collect([1, 2, 2, 2, 3])

collection.countBy().all()
// => { '1': 1, '2': 3, '3': 1 }
```

**Complex Example (Custom String Resolution):**
Pass a callback to map items to a string key, grouping the results.

```typescript
const emails = collect(['alice@gmail.com', 'bob@yahoo.com', 'charlie@gmail.com'])

// Count how many users use each top-level domain
const domains = emails.countBy((email) => email.split('@')[1])

domains.all()
// => { 'gmail.com': 2, 'yahoo.com': 1 }
```

---

## `crossJoin`

Cross joins the collection's values among the given arrays or collections, returning all possible permutations (Cartesian product).

**Simple Example:**

```typescript
const colors = collect(['Red', 'Green'])
const sizes = ['S', 'M']

const matrix = colors.crossJoin(sizes)

matrix.all()
/*
[
    ['Red', 'S'],
    ['Red', 'M'],
    ['Green', 'S'],
    ['Green', 'M'],
]
*/
```

**Complex Example (Multiple Joins):**

```typescript
const types = collect(['Shirt'])
const sizes = ['S']
const colors = ['Red', 'Blue']

const matrix = types.crossJoin(sizes, colors)

matrix.all()
/*
[
    ['Shirt', 'S', 'Red'],
    ['Shirt', 'S', 'Blue']
]
*/
```
