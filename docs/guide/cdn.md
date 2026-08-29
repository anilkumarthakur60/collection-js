# CDN Usage

`@anil-labs/collection-js` is framework-independent and ships a browser-ready **IIFE bundle** (`dist/index.global.js`) alongside its ESM and CJS builds. The package's `unpkg` and `jsdelivr` fields point straight at it, so loading the bare package URL gives you the global build  no bundler, no build step, no Node.

## Quick Start

```html
<script src="https://unpkg.com/@anil-labs/collection-js"></script>
<script>
  const { collect } = CollectionJS

  collect([3, 1, 4, 1, 5, 9, 2, 6])
    .unique()
    .sort()
    .filter((n) => n % 2 === 0)
    .all()
  // => [2, 4, 6]
</script>
```

The same works via jsDelivr:

```html
<script src="https://cdn.jsdelivr.net/npm/@anil-labs/collection-js"></script>
```

## Pinning a Version

A bare CDN URL always serves the latest published release. For production, pin the version (and let the CDN's `dist`-field resolution pick the file, or spell it out):

```html
<!-- unpkg  resolves to dist/index.global.js automatically -->
<script src="https://unpkg.com/@anil-labs/collection-js@0.1.0"></script>

<!-- jsDelivr  explicit file path also works -->
<script src="https://cdn.jsdelivr.net/npm/@anil-labs/collection-js@0.1.0/dist/index.global.js"></script>
```

## The `CollectionJS` Global

The script registers a single global, `window.CollectionJS`, containing the package's entire named-export surface  the same API you would import from npm:

```js
const {
  // Helpers
  collect,
  lazy,

  // Classes
  Collection,
  LazyCollection,
  AsyncCollection,

  // I/O
  parseCsv,
  toCsv,
  parseJsonl,
  toJsonl,
  fromReadable,
  lines,

  // Every method as a standalone pure function
  operations,

  // Support utilities
  dataGet,
  dataSet,
  deepEqual,
  deepClone
} = CollectionJS
```

::: tip Where is the default export?
IIFE builds expose the module namespace, so the default `collect` helper lives at `CollectionJS.default`. Prefer the identical named export instead: `CollectionJS.collect`.
:::

## A Complete Page

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>collection-js from a CDN</title>
  </head>
  <body>
    <pre id="out"></pre>

    <script src="https://unpkg.com/@anil-labs/collection-js"></script>
    <script>
      const { collect } = CollectionJS

      const topScorers = collect([
        { name: 'Alice', score: 95 },
        { name: 'Bob', score: 80 },
        { name: 'Charlie', score: 92 }
      ])
        .where('score', '>=', 90)
        .sortByDesc('score')
        .pluck('name')
        .all()

      document.querySelector('#out').textContent = JSON.stringify(topScorers)
      // ["Alice", "Charlie"]
    </script>
  </body>
</html>
```

A runnable version of this page lives in the repository at [`examples/cdn`](https://github.com/anilkumarthakur60/collection-js/tree/main/examples/cdn).

## Notes

- The global build targets **ES2020**, so it runs in all evergreen browsers.
- Macros registered on the CDN copy of `Collection` are scoped to that copy  if the same page also runs a bundled npm copy of the package, each copy has its own class and its own macro registry.
- Everything in one file: the IIFE bundles the full library (collections, lazy, async, I/O, operations). If you only need a slice of the API in a size-sensitive app, install from npm and let your bundler do the work.
