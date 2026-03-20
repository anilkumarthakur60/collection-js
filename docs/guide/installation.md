# Installation

The package is published natively on npm and requires **Node.js 16+**.

## Package Managers

Install the `@anilkumarthakur/collection` package via your preferred package manager:

::: code-group
```bash [npm]
npm install @anilkumarthakur/collection
```
```bash [yarn]
yarn add @anilkumarthakur/collection
```
```bash [pnpm]
pnpm add @anilkumarthakur/collection
```
```bash [bun]
bun add @anilkumarthakur/collection
```
:::

## Importing

There are three ways to import and use the library depending on your architecture.

### 1. Default Import (Recommended)

The most common way to create a collection is using the default `collect` helper.

```typescript
import collect from '@anilkumarthakur/collection'

const items = collect([1, 2, 3])
```

### 2. Class Import

If you prefer instantiating objects directly via `new`:

```typescript
import { Collection } from '@anilkumarthakur/collection'

const items = new Collection([1, 2, 3])
```

### 3. Standalone Methods (Tree-Shaking)

If you only need a single function and don't want the entire Collection class in your bundle (useful for frontend performance), you can import individual static methods!

Note that standalone methods are executed immediately and do not return chainable instances unless you re-wrap them.

```typescript
import { pluck } from '@anilkumarthakur/collection/methods'

const names = pluck([{ name: 'Alice' }, { name: 'Bob' }], 'name')
// => ['Alice', 'Bob']
```
