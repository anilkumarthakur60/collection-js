# Methods (D - F)

## `dd`

Dumps the collection's items and halts execution of the script (throws an Error). Great for debugging chained operations.

**Simple Example:**

```typescript
import collect from '@anil-labs/collection-js'

const items = collect([1, 2, 3])

items
  .map((x) => x * 2)
  .dd() // Execution stops here and output is logged
  .filter((x) => x > 4)
```

---

## `diff`

Compares the collection against another collection or a plain JavaScript array based on its values. Returns the values in the original collection that are not present in the given parameters.

**Simple Example:**

```typescript
const original = collect([1, 2, 3, 4, 5])
const compared = [2, 4, 6]

const difference = original.diff(compared)

difference.all()
// => [1, 3, 5]
```

---

## `diffAssoc`

Compares an array of objects against another, keeping the elements whose key/value pairs are not fully present in the comparison set. The comparison argument must be an array (or collection) of objects.

**Simple Example:**

```typescript
const items = collect([{ color: 'orange', type: 'fruit', remain: 6 }])

const diff = items.diffAssoc([{ color: 'yellow', type: 'fruit', remain: 3, used: 6 }])

diff.all()
// => [{ color: 'orange', type: 'fruit', remain: 6 }]  (kept — it differs from the comparison object)
```

---

## `diffAssocUsing`

Operates like `diffAssoc`, but compares whole elements with a custom comparator (returning `0` when two elements are considered equal). The comparison argument is an array/collection.

**Complex Example:**

```typescript
const items = collect([{ id: 1 }, { id: 2 }])

// Keep elements that are not "equal" to any element in the comparison set
const diff = items.diffAssocUsing([{ id: 2 }], (a, b) => (a.id === b.id ? 0 : 1))

diff.all()
// => [{ id: 1 }]
```

---

## `diffKeys`

For each object element, drops the keys present in the given list of keys, keeping the rest.

**Simple Example:**

```typescript
const original = collect([{ a: 'foo', b: 'bar', c: 'baz' }])

const diff = original.diffKeys(['a', 'd'])

diff.all()
// => [{ b: 'bar', c: 'baz' }]
```

---

## `doesntContain`

The inverse of `contains`. Determines whether the collection does not contain a given item.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5])

items.doesntContain(5) // => false
items.doesntContain(6) // => true
```

---

## `doesntContainStrict`

Determines whether the collection does not contain a given item using strict equality (`===`).

**Simple Example:**

```typescript
const items = collect([1, 2, 3])

items.doesntContainStrict('2') // => true
items.doesntContainStrict(2) // => false
```

---

## `dot`

Flattens a nested object into a single-level object whose keys use "dot" notation to indicate depth. This is a **terminal** method — it returns a plain object directly (not a chainable collection). Pass the source object as a single collection element.

**Complex Example (Flattening nested configurations):**

```typescript
const config = collect([
  {
    db: { host: 'localhost', port: 3306 },
    logging: { errors: true }
  }
])

config.dot()
/*
{
    'db.host': 'localhost',
    'db.port': 3306,
    'logging.errors': true
}
*/
```

---

## `dump`

Dumps the collection's items in the console, but **does not** halt execution (unlike `dd`). Great for observing pipelines.

**Simple Example:**

```typescript
collect([1, 2, 3])
  .dump() // Logs [1, 2, 3]
  .map((i) => i * 2)
  .dump() // Logs [2, 4, 6]
```

---

## `duplicates`

Retrieves the duplicate values from a collection. This is a **terminal** method — it returns a plain object keyed by the original indices (not a chainable collection).

**Simple Example:**

```typescript
const items = collect(['a', 'b', 'a', 'c', 'b'])

items.duplicates()
// => { '2': 'a', '4': 'b' } // keys are the original indices
```

---

## `duplicatesStrict`

Returns all duplicates utilizing strict equality (`===`). Like `duplicates`, this is a **terminal** method returning a plain object.

**Simple Example:**

```typescript
const items = collect([1, 2, '1'])

items.duplicatesStrict()
// => {} // 1 and '1' are not strictly equal, so neither counts as a duplicate
```

---

## `each`

Iterates over the items in the collection and passes each item to a callback. If you wish to stop iterating, you may return `false` from your callback.

**Simple Example:**

```typescript
collect([1, 2, 3]).each((item, key) => {
  // Operations
})
```

**Complex Example (Breaking early):**

```typescript
collect([1, 2, 3, 4, 5]).each((item) => {
  if (item > 3) {
    return false // Loop breaks down here
  }
  console.log(item)
})
```

---

## `eachSpread`

Iterates over the collection's arrays, but directly mapping each array element into the callback's arguments.

**Simple Example:**

```typescript
const coords = collect([
  [10, 20],
  [50, 60]
])

coords.eachSpread((x, y) => {
  // x = 10, y = 20
  // x = 50, y = 60
})
```

---

## `ensure`

Verifies that every element of a collection matches a given type, throwing an `UnexpectedValueException` otherwise. Use **primitive type strings** (`'number'`, `'string'`, `'boolean'`, `'object'`, `'array'`) for primitives, and **constructors** for class instances. You may pass several types.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4])

items.ensure('number') // Will succeed
items.ensure('string') // Throws UnexpectedValueException

// Class instances use the constructor:
collect([new User(), new User()]).ensure(User)

// Multiple accepted types:
collect([1, 'two']).ensure('number', 'string')
```

::: warning
Use the string `'number'`, not the `Number` constructor — primitives are not `instanceof Number`, so `ensure(Number)` would throw for `[1, 2, 3]`.
:::

---

## `every`

May be used to verify that all elements of a collection pass a given truth test.

**Simple Example:**

```typescript
collect([1, 2, 3, 4]).every((i) => i > 0) // => true
collect([1, 2, 3, 4]).every((i) => i > 2) // => false
```

---

## `except`

Drops the specified keys from each object element, returning a `Collection<Partial<T>>`.

**Simple Example:**

```typescript
const user = collect([{ id: 1, name: 'Alice', password: 'secret' }])

user.except(['password']).all()
// => [{ id: 1, name: 'Alice' }]
```

---

## `filter`

Filters the collection using the given callback, keeping only those items that pass a given truth test.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4, 5])

const evens = items.filter((a) => a % 2 === 0)

evens.all()
// => [2, 4]
```

**Complex Example (Without Callback):**
If no callback is supplied, `filter` removes all falsy values (`false`, `null`, `undefined`, `""`, `0`, `NaN`).

```typescript
collect([1, 2, 3, null, false, '', 4]).filter().all()
// => [1, 2, 3, 4]
```

---

## `first`

Returns the first element in the collection that passes a given truth test, or `undefined` when nothing matches. (There is no default-value argument — use `??` to supply a fallback.)

**Simple Example:**

```typescript
collect([1, 2, 3, 4]).first((i) => i > 2)
// => 3
```

**Complex Example (Without Truth Test / Fallback):**

```typescript
// No truth test returns the first item
collect([1, 2, 3]).first()
// => 1

// No match returns undefined; use ?? for a fallback
collect([1, 2, 3]).first((i) => i > 5) ?? 0
// => 0
```

---

## `firstOrFail`

Acts like `.first()`, however if no result is found, it will deliberately throw an `ItemNotFoundException`.

**Simple Example:**

```typescript
const items = collect([1, 2, 3])

items.firstOrFail((i) => i > 5) // Throws Error
```

---

## `firstWhere`

Returns the first element in the collection with the given key / value pair.

**Simple Example:**

```typescript
const users = collect([
  { name: 'Alice', role: 'admin' },
  { name: 'Bob', role: 'editor' },
  { name: 'Charlie', role: 'admin' }
])

users.firstWhere('role', 'admin')
// => { name: 'Alice', role: 'admin' }
```

---

## `flatMap`

Passes the collection through a mapping callback, and flattens the result by a single level.

**Complex Example:**

```typescript
const tags = collect([
  { name: 'JS', children: ['Vue', 'React'] },
  { name: 'PHP', children: ['Laravel', 'Symfony'] }
])

const frameworks = tags.flatMap((item) => item.children)

frameworks.all()
// => ['Vue', 'React', 'Laravel', 'Symfony']
```

---

## `flatten`

Flattens a multi-dimensional collection into a single dimension.

**Simple Example:**

```typescript
const collection = collect(['apple', ['banana', 'orange']])

collection.flatten().all()
// => ['apple', 'banana', 'orange']
```

**Complex Example (Depth Param):**
You may optionally pass the function a "depth" argument.

```typescript
const collection = collect(['apple', ['banana', ['orange']]])

collection.flatten(1).all()
// => ['apple', 'banana', ['orange']]

collection.flatten(Infinity).all()
// => ['apple', 'banana', 'orange']
```

---

## `flip`

Maps each scalar value to its index, returning a collection that wraps the resulting object. (It operates on the collection's elements, so pass an array of values — not a pre-built object.)

**Simple Example:**

```typescript
const collection = collect(['name', 'framework'])

collection.flip().all()
// => [{ name: 0, framework: 1 }]
```

---

## `forget`

Removes data from the collection **in place**. A numeric key removes the element at that index; a string key removes that property from every object element. Returns the same collection.

**Simple Example:**

```typescript
// String key: strip a property from each object element
collect([{ name: 'anil', framework: 'laravel' }])
  .forget('framework')
  .all()
// => [{ name: 'anil' }]

// Numeric key: remove the element at an index
collect(['a', 'b', 'c']).forget(1).all()
// => ['a', 'c']
```

---

## `forPage`

Returns a new collection containing the items that would be present on a given page number.

**Complex Example:**
Perfect for basic pagination. Pass the `page` first, then `perPage` limit.

```typescript
const collection = collect([1, 2, 3, 4, 5, 6, 7, 8, 9])

const chunk = collection.forPage(2, 3)

chunk.all()
// => [4, 5, 6]
```

---

## `fromJson`

Transforms a valid JSON string directly into a Collection. This is a **static** method on the `Collection` class. A decoded object is wrapped as a single element; a decoded array becomes the collection's items.

**Simple Example:**

```typescript
import { Collection } from '@anil-labs/collection-js'

Collection.fromJson('[1, 2, 3]').all()
// => [1, 2, 3]

Collection.fromJson('{"name": "Alice", "age": 25}').all()
// => [{ name: 'Alice', age: 25 }]
```
