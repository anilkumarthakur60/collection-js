# Introduction

Welcome to **@anil-labs/collection-js**!

This library provides a fluent, highly readable, and chainable API for working with arrays of data in JavaScript and TypeScript.

It is heavily inspired by the beloved and incredibly powerful **Laravel Collection** API, bringing 150+ methods of data-manipulation joy to the JavaScript ecosystem — full Laravel parity plus statistics, SQL-style joins, combinatorics, async streams, and CSV/JSONL I/O.

## Why Collections?

Native JavaScript array methods like `map`, `filter`, and `reduce` are great, but they often fall short when dealing with complex data transformations, grouping, partitioning, or recursive manipulation.

This library solves that by providing an elegant, chainable wrapper around your arrays:

### Native JS Approach (Clunky)

```typescript
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Charlie', age: 35, active: true }
]

const activeNames = users
  .filter((user) => user.active)
  .sort((a, b) => b.age - a.age)
  .map((user) => user.name)

// Result: ['Charlie', 'Alice']
```

### Collection Approach (Fluent & Elegant)

```typescript
import collect from '@anil-labs/collection-js'

const activeNames = collect(users).where('active', true).sortByDesc('age').pluck('name').all()

// Result: ['Charlie', 'Alice']
```

## Features

- 🔗 **Fluent & Chainable:** Never break your train of thought. Chain methods indefinitely.
- 🦋 **Strict TypeScript:** Deep type-inference and a strict, `any`-free public surface.
- ⚡ **Tree-Shakable:** Zero runtime dependencies; every method is also a standalone pure function.
- 💤 **Lazy & Async:** Handle infinite data with `LazyCollection`, or stream `AsyncIterable` sources with `AsyncCollection`.
- 🐘 **Laravel Parity:** Mirrors the Laravel 13.x Collections API one-to-one.
- 📊 **Beyond Laravel:** Statistics, SQL-style joins, combinatorics, and CSV/JSONL I/O. See [Beyond Laravel](/guide/beyond-laravel).
- ✅ **Thoroughly Tested:** Backed by a comprehensive, edge-case-driven test suite.
