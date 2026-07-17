# @anil-labs/collection-js

## 0.2.0

### Minor Changes

- b81c91b: Rewrite as a pnpm workspace monorepo, add a CDN build, and fix audited bugs.

  **New**

  - Ships an IIFE/UMD-style bundle alongside ESM and CJS. `dist/index.global.js` exposes a `CollectionJS` global and the `unpkg`/`jsdelivr` fields are set, so the library now works straight off a CDN in the browser as well as via a bundler in any framework.

  **Fixes**

  - **Security (prototype pollution):** `dataSet()` and `undot()` now reject `__proto__`, `constructor`, and `prototype` path segments and only descend into a target's own members, closing a prototype-pollution vector reachable through attacker-controlled keys.
  - `AsyncCollection.mapAsync` no longer leaks unhandled promise rejections.
  - The CSV parser strips a leading UTF-8 BOM.
  - `duplicates()` reports the correct source index.
  - All 25 higher-order message targets (`each`, `map`, `filter`, …) are wired up.

  **Behavior changes** (may require action when upgrading)

  - `sortBy` no longer treats a two-argument retriever function as a comparator; pass an explicit comparator when you need custom ordering.
  - `put()` mutates in place and returns the collection, matching Laravel semantics.
  - `get(index, default)` distinguishes a stored `undefined` from a missing key.
  - `all()` and `toJSON()` return copies rather than the internal backing array.
  - Keyed results (e.g. from `groupBy`) expose chainable `Collection` groups.
