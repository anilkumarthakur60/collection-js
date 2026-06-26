# Installation

The package is published natively on npm and requires **Node.js 18+** — or no Node at all when loaded [from a CDN](/guide/cdn).

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

## CDN (No Build Step)

The package also ships a browser-ready global build. One script tag exposes the `CollectionJS` global — no bundler, no build:

```html
<script src="https://unpkg.com/@anil-labs/collection-js"></script>
<script>
  const { collect } = CollectionJS
  collect([1, 2, 3]).sum() // => 6
</script>
```

See the [CDN Usage guide](/guide/cdn) for jsDelivr URLs, version pinning, and the full global surface.

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

### 3. Standalone Operations

Every collection method is also available as a pure function under the `operations` namespace. If you prefer plain functions over the fluent class — or you are composing your own pipeline — import `operations` and call the underlying function directly.

These functions are executed immediately and operate on plain arrays — they do not return chainable instances unless you re-wrap them with `collect`.

::: info Bundle size
`operations` is a namespace re-export from the package root, so most bundlers keep the namespace together — importing a single function will not dramatically shrink your bundle today. Per-module subpath exports are on the roadmap.
:::

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
