# Introduction

Welcome to **@anilkumarthakur/collection-js**!

This library provides a fluent, highly readable, and chainable API for working with arrays of data in JavaScript and TypeScript.

It is heavily inspired by the beloved and incredibly powerful **Laravel Collection** API, bringing over 120+ methods of data-manipulation joy to the JavaScript ecosystem.

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
import collect from '@anilkumarthakur/collection-js'

const activeNames = collect(users).where('active', true).sortByDesc('age').pluck('name').all()

// Result: ['Charlie', 'Alice']
```

## Features

- 🔗 **Fluent & Chainable:** Never break your train of thought. Chain methods indefinitely.
- 🦋 **TypeScript Native:** Deep type-inference helps ensure robust code.
- ⚡ **Tree-Shakable:** Need just one method? Import only what you need to keep bundles small.
- 💤 **Lazy Evaluation:** Handle infinite data or gigantic lists seamlessly with `LazyCollection`.
- 🐘 **Laravel Parity:** Backed by 120+ identical algorithms pulled straight from Laravel 13.x.
- ✅ **100% Tested:** Robustly tested against edge-cases.
