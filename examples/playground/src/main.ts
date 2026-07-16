import { collect, lazy, AsyncCollection } from '@anil-labs/collection-js'

const out: string[] = []
const log = (label: string, value: unknown): void => {
  out.push(`${label}\n  ${JSON.stringify(value)}`)
}

// ── Collection: fluent chaining ─────────────────────────────────────
const totals = collect([
  { product: 'Chair', price: 100, qty: 2 },
  { product: 'Desk', price: 200, qty: 1 },
  { product: 'Lamp', price: 50, qty: 4 }
])
  .map((item) => ({ ...item, total: item.price * item.qty }))
  .sortBy('total')
  .pluck('product')
  .all()
log('sortBy(total).pluck(product)', totals)

log(
  'sum of totals',
  collect([100, 200, 50]).sum((n) => n)
)

// ── groupBy ─────────────────────────────────────────────────────────
const byParity = collect([1, 2, 3, 4, 5]).groupBy((n) => (n % 2 === 0 ? 'even' : 'odd'))
log('groupBy parity', byParity)

// ── LazyCollection: compute only what is consumed ───────────────────
const firstThreeSquares = lazy(function* () {
  for (let i = 1; ; i++) yield i
})
  .map((n) => n * n)
  .take(3)
  .all()
log('lazy infinite → take(3)', firstThreeSquares)

// ── AsyncCollection ─────────────────────────────────────────────────
const doubled = await AsyncCollection.from([1, 2, 3])
  .map(async (n) => n * 2)
  .toArray()
log('async map', doubled)

document.querySelector('#out')!.textContent = out.join('\n\n')
