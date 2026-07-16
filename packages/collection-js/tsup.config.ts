import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  // Triple build: ESM (.js) + CJS (.cjs) for bundlers/Node, and an IIFE
  // (index.global.js) exposing `CollectionJS` for direct CDN <script> usage.
  format: ['esm', 'cjs', 'iife'],
  globalName: 'CollectionJS',
  dts: true,
  clean: true,
  treeshake: true,
  sourcemap: true,
  target: 'es2020',
  tsconfig: 'tsconfig.tsup.json'
})
