# Methods (D - F)

## `dd`

Dumps the collection's items and halts execution of the script (throws an Error). Great for debugging chained operations.

**Simple Example:**

```typescript
import collect from '@anilkumarthakur/collection-js'

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

Compares the collection against another collection or array based on **keys and values**. This is particularly useful for extracting the changed attributes out of an object.

**Simple Example:**

```typescript
const color = collect({ color: 'orange', type: 'fruit', remain: 6 })
const diff = color.diffAssoc({ color: 'yellow', type: 'fruit', remain: 3, used: 6 })

diff.all()
// => { color: 'orange', remain: 6 }
```

---

## `diffAssocUsing`

Operates like `diffAssoc`, but allows you to pass a custom callback function to perform the comparison.

**Complex Example:**

```typescript
const color = collect({ color: 'orange', type: 'fruit', remain: 6 })
const compare = { color: 'ORANGE', type: 'fruit' }

// Custom comparison neglecting exact case
const diff = color.diffAssocUsing(compare, (a, b) => {
  return String(a).toLowerCase() === String(b).toLowerCase() ? 0 : 1
})

diff.all()
// => { remain: 6 } // 'orange' and 'ORANGE' are considered equal
```

---

## `diffKeys`

Compares the collection against another based on its **keys** only. It will return the key / value pairs from the original collection that aren't present in the given data.

**Simple Example:**

```typescript
const original = collect({ a: 'foo', b: 'bar', c: 'baz' })
const diff = original.diffKeys({ a: 'foo', d: 'x' })

diff.all()
// => { b: 'bar', c: 'baz' }
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

Flattens a multi-dimensional associative array (objects) into a single level array that uses "dot" notation to indicate depth.

**Complex Example (Flattening nested configurations):**

```typescript
const config = collect({
  db: {
    host: 'localhost',
    port: 3306
  },
  logging: {
    errors: true
  }
})

const flat = config.dot()

flat.all()
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

Retrieves and returns all of the duplicate values from a collection.

**Simple Example:**

```typescript
const items = collect(['a', 'b', 'a', 'c', 'b'])

items.duplicates().all()
// => { '2': 'a', '4': 'b' } // Returns the original indices as keys
```

---

## `duplicatesStrict`

Returns all duplicates utilizing strict equality (`===`).

**Simple Example:**

```typescript
const items = collect([1, 2, '1'])

items.duplicatesStrict().all()
// => {} // Loose match won't trigger strict duplicates
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

Verifies that all elements of a collection are of a given type. Alternatively you can provide an array of types, or instances. Throws an `UnexpectedValueException` if verification fails.

**Simple Example:**

```typescript
const items = collect([1, 2, 3, 4])

items.ensure(Number) // Will succeed
items.ensure(String) // Will throw Error
```

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

Returns all items in the collection except for those with the specified keys.

**Simple Example:**

```typescript
const user = collect({ id: 1, name: 'Alice', password: 'secret' })

const returned = user.except(['password'])

returned.all()
// => { id: 1, name: 'Alice' }
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

Returns the first element in the collection that passes a given truth test. You can return a default fallback if none match.

**Simple Example:**

```typescript
collect([1, 2, 3, 4]).first((i) => i > 2)
// => 3
```

**Complex Example (Without Truth Test / Default value):**

```typescript
// No truth test returns the absolute first object
collect([1, 2, 3]).first()
// => 1

// With a fallback default
collect([1, 2, 3]).first((i) => i > 5, 0)
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

Swaps the collection's keys with their corresponding values (for objects/dictionaries).

**Simple Example:**

```typescript
const collection = collect({ name: 'anil', framework: 'laravel' })

collection.flip().all()
// => { anil: 'name', laravel: 'framework' }
```

---

## `forget`

Removes an item from the collection by its key.

**Simple Example:**

```typescript
const collection = collect({ name: 'anil', framework: 'laravel' })

collection.forget('framework').all()
// => { name: 'anil' }
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

Transforms a valid JSON string directly into a Collection.

**Simple Example:**

```typescript
const collection = collect().fromJson('{"name": "Alice", "age": 25}')

collection.all()
// => { name: 'Alice', age: 25 }
```
