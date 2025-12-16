# Lazy Collections

While standard Collections are fantastic for most use-cases, they keep the entire array in memory. If you are processing a file with 1,000,000 lines, or pulling 100,000 rows from a database, a standard Collection could easily crash your process or cause an Out of Memory (OOM) error.

This is where `LazyCollection` comes in.

Lazy Collections leverage JavaScript **Generators** (`function* () { yield x }`). Because generators yield data one item at a time, Lazy Collections allow you to work with massive (or even infinite!) datasets while keeping memory usage extraordinarily low.

## Creating a Lazy Collection

To create a Lazy Collection, import the class and pass a generator function (or any iterable) to its constructor:

```typescript
import { LazyCollection } from '@anilkumarthakur/collection-js'

const lazy = new LazyCollection(function* () {
  for (let i = 1; i <= 1_000_000; i++) {
    yield i
  }
})
```

Alternatively, you may use the `.lazy()` method on a pre-existing standard Collection:

```typescript
const standard = collect([1, 2, 3])
const lazy = standard.lazy()
```

## The Power of Lazy Evaluation

Let's look at an example. Imagine we want to generate 1,000,000 numbers, filter out the even ones, map them by multiplying by 2, but we only actually need the **first 5 results**.

With a standard collection, JavaScript arrays would immediately allocate 1M numbers into memory, loop over 1M items to filter them, loop over 500k items to map them, and then finally take the first 5.

**With a Lazy Collection:**

```typescript
const lazy = new LazyCollection(function* () {
  for (let i = 0; i < 1_000_000; i++) yield i
})

const result = lazy
  .filter((n) => n % 2 === 0)
  .map((n) => n * 2)
  .take(5)
  .all()

// Result: [0, 4, 8, 12, 16]
```

Because of the `take(5)` at the end of the chain, the `LazyCollection` only evaluated the massive generator up until it found 5 passing matches.
**It never instantiated 1,000,000 items in memory.** It stopped processing entirely after `i = 8`!

## Converting to a Standard Collection

Once you have pruned your massive, lazy dataset down to an acceptable size, you can convert it back into a standard, memory-backed Collection to utilize standard methods using the `collect()` method:

```typescript
const lazy = new LazyCollection(function* () {
  yield 'A'
  yield 'B'
  yield 'C'
})

// Convert to standard collection
const collection = lazy.collect()
```
