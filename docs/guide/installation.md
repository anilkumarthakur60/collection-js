# Installation

The package is published natively on npm and requires **Node.js 16+**.

## Package Managers

Install the `@anil-labs/collection-js` package via your preferred package manager:

::: code-group

```bash [npm]
npm install @anil-labs/collection-js
```

```bash [yarn]
yarn add @anil-labs/collection-js
```

```bash [pnpm]
pnpm add @anil-labs/collection-js
```

```bash [bun]
bun add @anil-labs/collection-js
```

:::

## Importing

There are three ways to import and use the library depending on your architecture.

### 1. Default Import (Recommended)

The most common way to create a collection is using the default `collect` helper.

```typescript
import collect from '@anil-labs/collection-js'

const items = collect([1, 2, 3])
```

### 2. Class Import

If you prefer instantiating objects directly via `new`:

```typescript
import { Collection } from '@anil-labs/collection-js'

const items = new Collection([1, 2, 3])
```

### 3. Standalone Operations (Tree-Shaking)

Every collection method is also available as a pure function under the `operations` namespace. If you only need one transformation and don't want the whole `Collection` class in your bundle, import `operations` and call the underlying function directly.

These functions are executed immediately and operate on plain arrays — they do not return chainable instances unless you re-wrap them with `collect`.

```typescript
import { operations } from '@anil-labs/collection-js'

const names = operations.pluckOf([{ name: 'Alice' }, { name: 'Bob' }], 'name')
// => ['Alice', 'Bob']
```

A handful of support helpers are also exported at the top level for advanced use:

```typescript
import { dataGet, deepEqual, valueRetriever } from '@anil-labs/collection-js'

dataGet({ user: { name: 'Ada' } }, 'user.name') // => 'Ada'
```
