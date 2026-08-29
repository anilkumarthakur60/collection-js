# Usage

The `Collection` class provides a fluid, convenient wrapper for working with arrays of data.

To create a collection, pass an array into the `collect` function, or the `Collection` constructor.

```typescript
import collect from '@anil-labs/collection-js'

const items = collect([1, 2, 3])
```

## Extracting the underlying Array

Because almost all collection methods return a **new** instance of a Collection (preserving immutability), you must call `all()` or `toArray()` at the end of your chain to get the items as a native JS array. Both return a fresh shallow copy  mutating the result never corrupts the collection.

```typescript
const items = collect([1, 2, 3])

const multiplied = items.map((i) => i * 2)

console.log(multiplied) // Collection { items: [2, 4, 6] }
console.log(multiplied.all()) // [2, 4, 6]
```

## Immutability & Chaining

Most methods (like `map`, `filter`, `merge`) return a completely new Collection instance, leaving the original data untouched:

```typescript
const original = collect([1, 2, 3])
const doubled = original.map((n) => n * 2)

original.all() // [1, 2, 3]
doubled.all() // [2, 4, 6]
```

A small set of methods mutate the collection **in place** to match Laravel's behavior, returning the same instance: `push`, `prepend`, `pop`, `shift`, `pull`, `forget`, `splice`, `transform`, and `put` (note: `put(key, value)` sets the key on **every** object element  see the [API reference](/api/n-r#put)).

```typescript
const items = collect([1, 2, 3])
items.push(4) // mutates `items` and returns it

items.all() // [1, 2, 3, 4]
```

## Macroable (Extending Collections)

Collections are "macroable", which allows you to add your own methods to the Collection class at runtime.

You can use the `macro` method to register custom behavior. This is typically done during the bootstrapping phase of your application.

```typescript
import { Collection } from '@anil-labs/collection-js'

Collection.macro('toUpper', function (this: Collection<string>) {
  return this.map((item) => item.toUpperCase())
})

const items = collect(['first', 'second'])

items.toUpper().all()
// ['FIRST', 'SECOND']
```

::: warning Macros are app-global
`macro()` installs the method on the shared `Collection.prototype`, so it is
visible to every collection in the running application  including ones created
by your dependencies. Libraries should scope their extensions to a subclass
instead: `class MyCollection extends Collection {}` plus
`applyMacroable(MyCollection)` gives the subclass its own registry, while its
instances still inherit macros registered on `Collection`.
:::

TypeScript users should pair the registration with **module augmentation** so
call sites are typed:

```typescript
declare module '@anil-labs/collection-js' {
  interface Collection<T> {
    toUpper(this: Collection<string>): Collection<string>
  }
}
```

The static helpers `Collection.hasMacro(name)`, `Collection.getMacro(name)`,
and `Collection.flushMacros()` inspect and reset the registry (handy in tests).

## Higher-Order Messages

Every method in `HIGHER_ORDER_TARGETS` (`each`, `map`, `filter`, `sum`, `avg`,
`max`, `min`, `groupBy`, `sortBy`, `unique`, …) supports Laravel-style
higher-order messages via **property access**, in addition to its normal call
form:

```typescript
users.sum.score // users.sum((u) => u.score)        → number
users.map.name // users.map((u) => u.name)         → Collection<string>
users.filter.active // users.filter((u) => u.active)   → Collection<User>
users.groupBy.role // users.groupBy((u) => u.role)    → Record<string, Collection<User>>
users.where('role', 'admin').each.notify() // calls notify() on every admin
```

Two behaviors, by target:

- **`each`** defers: `users.each.notify(...)` returns a function; invoking it
  calls the named method on every item (forwarding arguments).
- **Every other target** evaluates eagerly at property access with an accessor
  for the named key (dotted paths work through `dataGet`), returning the real
  result  a number, boolean, `Collection`, record, or `[Collection, Collection]`.

Because property access *is* the message syntax, `Function.prototype` members
(`name`, `length`, `call`, `bind`) are intentionally shadowed on these methods.

::: tip TypeScript
The property form is runtime-only  the static types keep the plain callable
signature, so cast at the access site:
`(users.map as unknown as { name: Collection<string> }).name`.
:::

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
