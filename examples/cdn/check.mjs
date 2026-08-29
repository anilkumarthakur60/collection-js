// The CDN demo is a plain HTML file  its "build" verifies the IIFE global
// bundle it loads actually exists and exposes the expected global.
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const bundle = fileURLToPath(
  new URL('../../packages/collection-js/dist/index.global.js', import.meta.url)
)

const source = await readFile(bundle, 'utf8')
if (!source.includes('CollectionJS')) {
  throw new Error(`Global bundle exists but does not define the CollectionJS global: ${bundle}`)
}
console.log('cdn example OK  index.global.js present and exposes CollectionJS')
