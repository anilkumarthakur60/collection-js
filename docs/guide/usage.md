# Usage

The `Collection` class provides a fluid, convenient wrapper for working with arrays of data.

To create a collection, pass an array into the `collect` function, or the `Collection` constructor.

```typescript
import collect from '@anilkumarthakur/collection-js'

const items = collect([1, 2, 3])
```

## Extracting the underlying Array

Because almost all collection methods return a **new** instance of a Collection (preserving immutability), you must call `all()` or `toArray()` at the end of your chain to return the underlying native JS array.

```typescript
const items = collect([1, 2, 3])

const multiplied = items.map((i) => i * 2)

console.log(multiplied) // Collection { items: [2, 4, 6] }
console.log(multiplied.all()) // [2, 4, 6]
```

## Immutability & Chaining

By default, Collections should be treated as **immutable**. Most methods (like `map`, `filter`, `merge`) will return a completely new Collection instance, leaving the original data untouched:

```typescript
const original = collect([1, 2, 3])
const appended = original.push(4)

original.all() // [1, 2, 3]
appended.all() // [1, 2, 3, 4]
```

## Macroable (Extending Collections)

Collections are "macroable", which allows you to add your own methods to the Collection class at runtime.

You can use the `macro` method to register custom behavior. This is typically done during the bootstrapping phase of your application.

```typescript
import { Collection } from '@anilkumarthakur/collection-js'

Collection.macro('toUpper', function () {
  return this.map((item: string) => item.toUpperCase())
})

const items = collect(['first', 'second'])

items.toUpper().all()
// ['FIRST', 'SECOND']
```

_(Note: TypeScript users will need to use module augmentation to type their macros)._

## Debugging

When building long chains, it can be hard to know what the data looks like in the middle of a pipeline.

Use the `dump()` or `dd()` (dump and die) methods to easily inspect the pipeline mid-stream!

```typescript
collect([1, 2, 3])
  .map((i) => i * 2)
  .dump() // Console logs: [2, 4, 6]
  .filter((i) => i > 2)
  .dd() // Logs: [4, 6] and halts process (throws Error)
```
